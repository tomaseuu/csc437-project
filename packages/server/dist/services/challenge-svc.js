import { Schema, model } from "mongoose";
const challengeSchema = new Schema({
    id: String,
    title: String,
    description: String,
    image: String,
    link: String
}, { collection: "challenges" });
const ChallengeModel = model("Challenge", challengeSchema);
function index() {
    return ChallengeModel.find().exec();
}
function get(id) {
    return ChallengeModel.findOne({ id })
        .exec()
        .then((challenge) => challenge ?? undefined);
}
function create(json) {
    const challenge = new ChallengeModel(json);
    return challenge.save();
}
function update(id, challenge) {
    return ChallengeModel.findOneAndUpdate({ id }, challenge, { new: true })
        .exec()
        .then((updated) => {
        if (!updated)
            throw new Error(`${id} not updated`);
        return updated;
    });
}
function remove(id) {
    return ChallengeModel.findOneAndDelete({ id })
        .exec()
        .then((deleted) => {
        if (!deleted)
            throw new Error(`${id} not deleted`);
    });
}
export default { index, get, create, update, remove };
