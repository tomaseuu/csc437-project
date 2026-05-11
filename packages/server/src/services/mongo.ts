import dotenv from "dotenv";
import mongoose from "mongoose";

mongoose.set("debug", true);
dotenv.config();

function getMongoURI(dbname: string): string {
  const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER } = process.env;

  if (MONGO_USER && MONGO_PWD && MONGO_CLUSTER) {
    return `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${dbname}?retryWrites=true&w=majority`;
  }

  return `mongodb://localhost:27017/${dbname}`;
}

export function connect(dbname: string) {
  return mongoose.connect(getMongoURI(dbname)).catch((error) => {
    console.log(error);
  });
}
