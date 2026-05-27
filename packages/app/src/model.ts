import { Challenge } from "server/models";

export interface Model {
  challenges?: Challenge[];
  selectedChallenge?: Challenge;
}

export const init: Model = {};
