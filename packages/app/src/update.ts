import { Auth } from "@unbndl/auth";
import { Challenge } from "server/models";
import { Model } from "./model";
import { Msg } from "./messages";

export type Cmd = ["challenges/load", { challenges: Challenge[] }];

type UpdateResult = Model | [Model, Promise<Cmd>];

export function update(
  model: Readonly<Model>,
  message: Msg | Cmd,
  user: Auth.Model,
): UpdateResult {
  const [type, payload] = message;

  switch (type) {
    case "challenges/request":
      if (model.challenges) {
        return model;
      }

      return [
        {
          ...model,
          challenges: [],
        },
        requestChallenges(user),
      ];

    case "challenges/load":
      return {
        ...model,
        challenges: payload.challenges,
      };

    case "challenge/select":
      return {
        ...model,
        selectedChallenge: payload.challenge,
      };

    default:
      throw new Error(`Unhandled message: ${type}`);
  }
}

function requestChallenges(user: Auth.Model): Promise<Cmd> {
  return fetch("/api/challenges", {
    headers: Auth.headers(user),
  })
    .then((response: Response) => {
      if (response.status === 200) {
        return response.json();
      }

      throw new Error(`No response from server: ${response.status}`);
    })
    .then((json: unknown) => {
      return ["challenges/load", { challenges: json as Challenge[] }];
    });
}
