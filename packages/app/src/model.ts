import { Challenge } from "server/models";

export interface Model {
  challenges?: Challenge[];
  selectedChallenge?: Challenge;
  creatingChallenge?: boolean;
  createChallengeError?: string;
  createdChallenge?: Challenge;
}

export const init: Model = {
  creatingChallenge: false,
};
