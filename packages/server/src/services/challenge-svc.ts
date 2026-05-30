import { Schema, model } from "mongoose";
import { Challenge } from "../models/index.ts";

const challengeSchema = new Schema<Challenge>(
  {
    id: String,
    owner: String,
    title: String,
    description: String,
    image: String,
    link: String,
    duration: String,
    status: String,
    stake: String,
    participantOneGoal: String,
    scoring: String
  },
  { collection: "challenges" }
);

const ChallengeModel = model<Challenge>("Challenge", challengeSchema);

function index(owner: string): Promise<Challenge[]> {
  return ChallengeModel.find({ owner }).exec();
}

function get(id: string, owner: string): Promise<Challenge | undefined> {
  return ChallengeModel.findOne({ id, owner })
    .exec()
    .then((challenge) => challenge ?? undefined);
}

function create(json: Challenge): Promise<Challenge> {
  const challenge = new ChallengeModel(json);
  return challenge.save();
}

function update(id: string, challenge: Challenge): Promise<Challenge> {
  return ChallengeModel.findOneAndUpdate(
    { id, owner: challenge.owner },
    challenge,
    { new: true }
  )
    .exec()
    .then((updated) => {
      if (!updated) throw new Error(`${id} not updated`);
      return updated as Challenge;
    });
}

function remove(id: string, owner: string): Promise<void> {
  return ChallengeModel.findOneAndDelete({ id, owner })
    .exec()
    .then((deleted) => {
      if (!deleted) throw new Error(`${id} not deleted`);
    });
}

export default { index, get, create, update, remove };
