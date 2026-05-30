import { Schema, model } from "mongoose";
const challengeSchema = new Schema({
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
}, { collection: "challenges" });
const ChallengeModel = model("Challenge", challengeSchema);
function index(username) {
    return ChallengeModel.find({
        $or: [
            { owner: username },
            { teammateUsername: username, teammateAccepted: true }
        ]
    }).exec();
}
function get(id, username) {
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
function invites(username) {
    return ChallengeModel.find({
        teammateUsername: username,
        teammateAccepted: false
    }).exec();
}
function acceptInvite(id, username) {
    return ChallengeModel.findOneAndUpdate({ id, teammateUsername: username, teammateAccepted: false }, { teammateAccepted: true }, { new: true })
        .exec()
        .then((challenge) => {
        if (!challenge)
            throw new Error(`${id} invite not found`);
        return challenge;
    });
}
function recordCheckIn(id, username, todayKey, totalDays) {
    return ChallengeModel.findOne({
        id,
        $or: [
            { owner: username },
            { teammateUsername: username, teammateAccepted: true }
        ]
    })
        .exec()
        .then((challenge) => {
        if (!challenge)
            throw new Error(`${id} challenge not found`);
        if (!challenge.startedOn) {
            challenge.startedOn = todayKey;
        }
        const isOwner = challenge.owner === username;
        const completedKey = isOwner ? "ownerCompletedDays" : "teammateCompletedDays";
        const lastKey = isOwner ? "ownerLastCompletedOn" : "teammateLastCompletedOn";
        const completedDays = Number(challenge[completedKey] || 0);
        const lastCompletedOn = String(challenge[lastKey] || "");
        if (lastCompletedOn === todayKey || completedDays >= totalDays) {
            return challenge;
        }
        challenge[completedKey] = completedDays + 1;
        challenge[lastKey] = todayKey;
        return challenge.save();
    })
        .then((challenge) => challenge);
}
function create(json) {
    const challenge = new ChallengeModel(json);
    return challenge.save();
}
function update(id, challenge) {
    return ChallengeModel.findOneAndUpdate({ id, owner: challenge.owner }, challenge, { new: true })
        .exec()
        .then((updated) => {
        if (!updated)
            throw new Error(`${id} not updated`);
        return updated;
    });
}
function remove(id, owner) {
    return ChallengeModel.findOneAndDelete({ id, owner })
        .exec()
        .then((deleted) => {
        if (!deleted)
            throw new Error(`${id} not deleted`);
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
