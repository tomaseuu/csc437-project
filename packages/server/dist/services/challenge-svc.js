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
export default { index, get };
