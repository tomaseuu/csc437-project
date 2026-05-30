import { Auth } from "@unbndl/auth";
import { Challenge } from "server/models";
import { Model } from "./model";
import { ChallengeForm, Msg } from "./messages";

export type Cmd =
  | ["challenges/load", { challenges: Challenge[] }]
  | ["challenge/created", { challenge: Challenge }]
  | ["challenge/createFailed", { error: string }];

type UpdateResult = Model | [Model, Promise<Cmd>];

export function update(
  model: Readonly<Model>,
  message: Msg | Cmd,
  user: Auth.Model,
): UpdateResult {
  const [type, payload] = message;

  switch (type) {
    case "challenges/request":
      return [
        {
          ...model,
          challenges: model.challenges ?? [],
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

    case "challenge/create":
      return [
        {
          ...model,
          creatingChallenge: true,
          createChallengeError: undefined,
          createdChallenge: undefined,
        },
        createChallenge(payload.challenge, user),
      ];

    case "challenge/created": {
      const nextChallenges = model.challenges
        ? [...model.challenges, payload.challenge]
        : model.challenges;

      return {
        ...model,
        challenges: nextChallenges,
        selectedChallenge: payload.challenge,
        creatingChallenge: false,
        createChallengeError: undefined,
        createdChallenge: payload.challenge,
      };
    }

    case "challenge/createFailed":
      return {
        ...model,
        creatingChallenge: false,
        createChallengeError: payload.error,
      };

    case "challenge/create/reset":
      return {
        ...model,
        creatingChallenge: false,
        createChallengeError: undefined,
        createdChallenge: undefined,
      };

    default:
      const unhandled: never = type;
      throw new Error(`Unhandled message: ${unhandled}`);
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

function createChallenge(
  challenge: ChallengeForm,
  user: Auth.Model,
): Promise<Cmd> {
  return fetch("/api/challenges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...Auth.headers(user),
    },
    body: JSON.stringify(challenge),
  })
    .then(async (response: Response) => {
      if (response.status === 201) {
        return response.json();
      }

      const payload = await response.json().catch(() => undefined);
      const message =
        payload && typeof payload === "object" && "error" in payload
          ? String((payload as { error: string }).error)
          : `HTTP ${response.status}`;

      throw new Error(message);
    })
    .then((json: unknown) => {
      return [
        "challenge/created",
        { challenge: json as Challenge },
      ] as Cmd;
    })
    .catch((error: unknown) => {
      return [
        "challenge/createFailed",
        { error: `Could not create challenge: ${String(error)}` },
      ] as Cmd;
    });
}
