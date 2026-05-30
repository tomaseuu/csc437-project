import { Schema, model } from "mongoose";
import { Challenge } from "../models/index.ts";

const challengeSchema = new Schema<Challenge>(
  {
    id: String,
    owner: String,
    title: String,
    description: String,
    link: String,
    startedOn: String,
    duration: String,
    status: String,
    stake: String,
    participantOneGoal: String,
    scoring: String,
    teammateUsername: String,
    teammateAccepted: Boolean,
    ownerCompletedDays: Number,
    ownerLastCompletedOn: String,
    teammateCompletedDays: Number,
    teammateLastCompletedOn: String
  },
  { collection: "challenges" }
);

const ChallengeModel = model<Challenge>("Challenge", challengeSchema);

function index(username: string): Promise<Challenge[]> {
  return ChallengeModel.find({
    $or: [
      { owner: username },
      { teammateUsername: username, teammateAccepted: true }
    ]
  }).exec();
}

function get(id: string, username: string): Promise<Challenge | undefined> {
  return ChallengeModel.findOne({
    id,
    $or: [
      { owner: username },
      { teammateUsername: username, teammateAccepted: true }
    ]
  })
    .exec()
    .then((challenge) => challenge ?? undefined);
}

function invites(username: string): Promise<Challenge[]> {
  return ChallengeModel.find({
    teammateUsername: username,
    teammateAccepted: false
  }).exec();
}

function acceptInvite(id: string, username: string): Promise<Challenge> {
  return ChallengeModel.findOneAndUpdate(
    { id, teammateUsername: username, teammateAccepted: false },
    { teammateAccepted: true },
    { new: true }
  )
    .exec()
    .then((challenge) => {
      if (!challenge) throw new Error(`${id} invite not found`);
      return challenge as Challenge;
    });
}

function recordCheckIn(
  id: string,
  username: string,
  todayKey: string,
  totalDays: number
): Promise<Challenge> {
  return ChallengeModel.findOne({
    id,
    $or: [
      { owner: username },
      { teammateUsername: username, teammateAccepted: true }
    ]
  })
    .exec()
    .then((challenge) => {
      if (!challenge) throw new Error(`${id} challenge not found`);

      if (!challenge.startedOn) {
        challenge.startedOn = todayKey;
      }

      const isOwner = challenge.owner === username;
      const completedKey = isOwner ? "ownerCompletedDays" : "teammateCompletedDays";
      const lastKey = isOwner ? "ownerLastCompletedOn" : "teammateLastCompletedOn";
      const completedDays = Number(challenge[completedKey] || 0);
      const lastCompletedOn = String(challenge[lastKey] || "");

      if (lastCompletedOn === todayKey || completedDays >= totalDays) {
        return challenge as Challenge;
      }

      challenge[completedKey] = completedDays + 1;
      challenge[lastKey] = todayKey;

      return challenge.save();
    })
    .then((challenge) => challenge as Challenge);
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

export default {
  index,
  get,
  invites,
  acceptInvite,
  recordCheckIn,
  create,
  update,
  remove
};
