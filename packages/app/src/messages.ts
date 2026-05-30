import { Challenge } from "server/models";

export interface ChallengeForm {
  title: string;
  description: string;
  duration: string;
  stake: string;
  participantOneGoal: string;
  scoring: string;
  teammateUsername?: string;
}

export type Msg =
  | ["challenges/request", {}]
  | ["challenges/load", { challenges: Challenge[] }]
  | ["challenge/select", { challenge: Challenge }]
  | ["challenge/create", { challenge: ChallengeForm }]
  | ["challenge/created", { challenge: Challenge }]
  | ["challenge/createFailed", { error: string }]
  | ["challenge/create/reset", {}];
