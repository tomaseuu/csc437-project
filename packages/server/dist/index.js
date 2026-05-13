import express from "express";
import { connect } from "./services/mongo.js";
import auth, { authenticateUser } from "./routes/auth.js";
import challengesRouter from "./routes/challenges.js";
const app = express();
const port = process.env.PORT || 3000;
const staticDir = process.env.STATIC || "public";
connect("habitchallenge");
app.use(express.static(staticDir));
app.use(express.json());
app.use("/auth", auth);
app.use("/api/challenges", authenticateUser, challengesRouter);
app.get("/hello", (req, res) => {
    res.send("Hello, World");
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
