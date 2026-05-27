import { Challenge } from "server/models";

export type Msg =
  | ["challenges/request", {}]
  | ["challenges/load", { challenges: Challenge[] }]
  | ["challenge/select", { challenge: Challenge }];
