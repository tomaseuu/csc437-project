import express, { Request, Response } from "express";
import { Challenge } from "../models/index.ts";
import Challenges from "../services/challenge-svc.ts";
import credentials from "../services/credential-svc.ts";
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

router.get("/invites", (req: Request, res: Response) => {
  const username = (req as AuthenticatedRequest).user?.username;

  if (!username) {
    res.status(401).end();
    return;
  }

  Challenges.invites(username)
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
  const duration = normalizeDuration(challengeData.duration);
  const teammateUsername = normalizeUsername(challengeData.teammateUsername);

  if (teammateUsername && teammateUsername === owner) {
    res.status(400).send({ error: "You cannot invite yourself." });
    return;
  }

  const newChallenge = {
    id,
    owner,
    title: challengeData.title || "Untitled Challenge",
    description: challengeData.description || "",
    link: challengeData.link || `/app/challenges/${encodeURIComponent(id)}`,
    startedOn: getTodayKey(),
    duration,
    status: challengeData.status || "Active",
    stake: challengeData.stake || "Friendly bragging rights.",
    participantOneGoal: challengeData.participantOneGoal || "Set a weekly goal",
    scoring:
      challengeData.scoring ||
      "Earn one point for each week you complete your goal.",
    teammateUsername,
    teammateAccepted: teammateUsername ? false : undefined
  } as Challenge;

  Promise.resolve()
    .then(() => {
      if (!teammateUsername) return;
      return credentials.exists(teammateUsername).then((found) => {
        if (!found) {
          throw new Error("That username does not exist.");
        }
      });
    })
    .then(() => Challenges.create(newChallenge))
    .then((challenge: Challenge) => res.status(201).json(challenge))
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      const status = message.includes("does not exist") || message.includes("yourself")
        ? 400
        : 500;
      res.status(status).send({ error: message });
    });
});

router.post("/:id/accept", (req: Request, res: Response) => {
  const username = (req as AuthenticatedRequest).user?.username;

  if (!username) {
    res.status(401).end();
    return;
  }

  Challenges.acceptInvite(req.params.id as string, username)
    .then((challenge: Challenge) => res.json(challenge))
    .catch(() => res.status(404).send({ error: "Invite not found." }));
});

router.post("/:id/checkin", (req: Request, res: Response) => {
  const username = (req as AuthenticatedRequest).user?.username;

  if (!username) {
    res.status(401).end();
    return;
  }

  const id = req.params.id as string;
  const todayKey = getTodayKey();

  Challenges.get(id, username)
    .then((challenge) => {
      if (!challenge) {
        throw new Error("Challenge not found.");
      }

      const totalDays = parseDurationToDays(challenge.duration || "7 days");
      const startedOn = challenge.startedOn || todayKey;

      if (isChallengeOver(startedOn, totalDays, todayKey)) {
        throw new Error("This challenge is already over.");
      }

      return Challenges.recordCheckIn(id, username, todayKey, totalDays);
    })
    .then((challenge: Challenge) => res.json(challenge))
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      const status = message.includes("not found")
        ? 404
        : message.includes("already over")
          ? 400
          : 500;
      res.status(status).send({ error: message });
    });
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

function normalizeDuration(value: string | undefined): string {
  const digits = String(value || "")
    .replace(/\D+/g, "")
    .trim();

  if (!digits) {
    return "7 days";
  }

  return `${digits} ${digits === "1" ? "day" : "days"}`;
}

function normalizeUsername(value: string | undefined): string | undefined {
  const username = String(value || "").trim();
  return username || undefined;
}

function parseDurationToDays(duration: string): number {
  const match = duration.match(/(\d+)/);
  const amount = match ? Number(match[1]) : 7;
  return Math.max(1, Math.min(amount, 365));
}

function getTodayKey(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isChallengeOver(
  startedOn: string,
  totalDays: number,
  todayKey: string,
): boolean {
  const currentDayIndex = getCurrentDayIndex(startedOn, todayKey);
  return currentDayIndex > totalDays;
}

function getCurrentDayIndex(startedOn: string, todayKey: string): number {
  const startedAt = new Date(`${startedOn}T00:00:00`);
  const todayAt = new Date(`${todayKey}T00:00:00`);

  if (Number.isNaN(startedAt.getTime()) || Number.isNaN(todayAt.getTime())) {
    return 1;
  }

  const diffMs = todayAt.getTime() - startedAt.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  return Math.max(1, diffDays + 1);
}

export default router;
