import express, { Request, Response } from "express";
import { Challenge } from "../models/index.ts";
import Challenges from "../services/challenge-svc.ts";
import { AuthenticatedRequest } from "./auth.ts";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  const owner = (req as AuthenticatedRequest).user?.username;

  if (!owner) {
    res.status(401).end();
    return;
  }

  Challenges.index(owner)
    .then((list: Challenge[]) => res.send(list))
    .catch((err) => res.status(500).send(err));
});

router.post("/", (req: Request, res: Response) => {
  const owner = (req as AuthenticatedRequest).user?.username;

  if (!owner) {
    res.status(401).end();
    return;
  }

  const challengeData = req.body as Partial<Challenge>;
  const id = challengeData.id || slugify(challengeData.title || "challenge");
  const newChallenge = {
    id,
    owner,
    title: challengeData.title || "Untitled Challenge",
    description: challengeData.description || "",
    image: challengeData.image || "",
    link: challengeData.link || `/app/challenges/${encodeURIComponent(id)}`,
    duration: challengeData.duration || "Custom duration",
    status: challengeData.status || "Active",
    stake: challengeData.stake || "Friendly bragging rights.",
    participantOneGoal: challengeData.participantOneGoal || "Set a weekly goal",
    scoring:
      challengeData.scoring ||
      "Earn one point for each week you complete your goal."
  } as Challenge;

  Challenges.create(newChallenge)
    .then((challenge: Challenge) => res.status(201).json(challenge))
    .catch((err) => res.status(500).send(err));
});

router.put("/:id", (req: Request, res: Response) => {
  const owner = (req as AuthenticatedRequest).user?.username;

  if (!owner) {
    res.status(401).end();
    return;
  }

  const id = req.params.id as string;
  const newChallenge = {
    ...(req.body as Challenge),
    owner
  } as Challenge;

  Challenges.update(id, newChallenge)
    .then((challenge: Challenge) => res.json(challenge))
    .catch(() => res.status(404).end());
});

router.delete("/:id", (req: Request, res: Response) => {
  const owner = (req as AuthenticatedRequest).user?.username;

  if (!owner) {
    res.status(401).end();
    return;
  }

  const id = req.params.id as string;

  Challenges.remove(id, owner)
    .then(() => res.status(204).end())
    .catch((err) => res.status(404).send(err));
});

router.get("/:id", (req: Request, res: Response) => {
  const owner = (req as AuthenticatedRequest).user?.username;

  if (!owner) {
    res.status(401).end();
    return;
  }

  const id = req.params.id as string;

  Challenges.get(id, owner)
    .then((challenge: Challenge | undefined) => {
      if (!challenge) {
        res.status(404).send();
      } else {
        res.send(challenge);
      }
    })
    .catch((err) => res.status(500).send(err));
});

function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base || "challenge"}-${Date.now().toString(36)}`;
}

export default router;
