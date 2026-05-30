import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";

import { Credential } from "../models/index.ts";

const credentialSchema = new Schema<Credential>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    username: {
      type: String,
      required: true,
      trim: true
    },
    hashedPassword: {
      type: String,
      required: true
    }
  },
  { collection: "user_credentials" }
);

const credentialModel = model<Credential>("Credential", credentialSchema);

function create(
  email: string,
  username: string,
  password: string
): Promise<Credential> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();

  return credentialModel
    .find({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
    })
    .exec()
    .then((found: Credential[]) => {
      if (found.some((cred) => cred.username === normalizedUsername)) {
        throw new Error("Username exists");
      }

      if (found.some((cred) => cred.email === normalizedEmail)) {
        throw new Error("Email exists");
      }
    })
    .then(() => bcrypt.genSalt(10))
    .then((salt: string) => bcrypt.hash(password, salt))
    .then((hashedPassword: string) => {
      const creds = new credentialModel({
        email: normalizedEmail,
        username: normalizedUsername,
        hashedPassword
      });

      return creds.save();
    });
}

function verify(username: string, password: string): Promise<string> {
  return credentialModel
    .find({ username })
    .exec()
    .then((found: Credential[]) => {
      if (!found || found.length !== 1) {
        throw new Error("Invalid username or password");
      }

      return found[0];
    })
    .then((credsOnFile: Credential) =>
      bcrypt
        .compare(password, credsOnFile.hashedPassword)
        .then((result: boolean) => {
          if (!result) {
            throw new Error("Invalid username or password");
          }

          return credsOnFile.username;
        })
    );
}

function exists(username: string): Promise<boolean> {
  return credentialModel
    .findOne({ username: username.trim() })
    .exec()
    .then((found) => Boolean(found));
}

export default { create, verify, exists };
