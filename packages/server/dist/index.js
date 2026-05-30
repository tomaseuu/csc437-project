import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import { connect } from "./services/mongo.js";
import auth, { authenticateUser } from "./routes/auth.js";
import challengesRouter from "./routes/challenges.js";
const app = express();
const port = process.env.PORT || 3000;
const staticDir = resolveStaticDir();
const spaIndex = path.resolve(staticDir, "index.html");
connect("habitchallenge");
app.use(express.static(staticDir));
app.use(express.json());
app.use("/auth", auth);
app.use("/api/challenges", authenticateUser, challengesRouter);
app.get("/hello", (req, res) => {
    res.send("Hello, World");
});
app.get(/^\/app(?:\/.*)?$/, async (_req, res) => {
    try {
        const html = await readFile(spaIndex, "utf8");
        res.type("html").send(html);
    }
    catch (error) {
        res.status(404).send(error);
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Serving static files from ${staticDir}`);
});
function resolveStaticDir() {
    if (process.env.STATIC) {
        return process.env.STATIC;
    }
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const appDist = path.resolve(currentDir, "../../app/dist");
    if (existsSync(appDist)) {
        return appDist;
    }
    return "public";
}
