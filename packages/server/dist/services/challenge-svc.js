import { Schema, model } from "mongoose";
const challengeSchema = new Schema({
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
}, { collection: "challenges" });
const ChallengeModel = model("Challenge", challengeSchema);
function index(owner) {
    return ChallengeModel.find({ owner }).exec();
}
function get(id, owner) {
    return ChallengeModel.findOne({ id, owner })
        .exec()
        .then((challenge) => challenge ?? undefined);
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
export default { index, get, create, update, remove };
