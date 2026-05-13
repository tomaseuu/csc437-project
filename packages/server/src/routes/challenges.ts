import express, { Request, Response } from "express";
import { Challenge } from "../models/index.ts";
import Challenges from "../services/challenge-svc.ts";

const router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  Challenges.index()
    .then((list: Challenge[]) => res.send(list))
    .catch((err) => res.status(500).send(err));
});

router.post("/", (req: Request, res: Response) => {
  const newChallenge = req.body as Challenge;

  Challenges.create(newChallenge)
    .then((challenge: Challenge) => res.status(201).json(challenge))
    .catch((err) => res.status(500).send(err));
});

router.put("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const newChallenge = req.body as Challenge;

  Challenges.update(id, newChallenge)
    .then((challenge: Challenge) => res.json(challenge))
    .catch(() => res.status(404).end());
});

router.delete("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;

  Challenges.remove(id)
    .then(() => res.status(204).end())
    .catch((err) => res.status(404).send(err));
});

router.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;

  Challenges.get(id)
    .then((challenge: Challenge | undefined) => {
      if (!challenge) {
        res.status(404).send();
      } else {
        res.send(challenge);
      }
    })
    .catch((err) => res.status(500).send(err));
});

export default router;
