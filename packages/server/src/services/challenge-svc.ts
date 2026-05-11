import { Schema, model } from "mongoose";
import { Challenge } from "../models/index.ts";

const challengeSchema = new Schema<Challenge>(
  {
    id: String,
    title: String,
    description: String,
    image: String,
    link: String
  },
  { collection: "challenges" }
);

const ChallengeModel = model<Challenge>("Challenge", challengeSchema);

function index(): Promise<Challenge[]> {
  return ChallengeModel.find().exec();
}

function get(id: string): Promise<Challenge | undefined> {
  return ChallengeModel.findOne({ id })
    .exec()
    .then((challenge) => challenge ?? undefined);
}

export default { index, get };
