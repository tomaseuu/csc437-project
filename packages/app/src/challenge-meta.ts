export interface Challenge {
  id: string;
  owner?: string;
  title: string;
  description: string;
  link: string;
  startedOn?: string;
  duration?: string;
  status?: string;
  stake?: string;
  participantOneGoal?: string;
  scoring?: string;
  teammateUsername?: string;
  teammateAccepted?: boolean;
  ownerCompletedDays?: number;
  ownerLastCompletedOn?: string;
  teammateCompletedDays?: number;
  teammateLastCompletedOn?: string;
}

interface Participant {
  name: string;
  goal: string;
  href?: string;
}

export interface ChallengeDetails {
  duration: string;
  status: string;
  stake: string;
  participantOne: Participant;
  participantTwo: Participant;
  scoring: string;
  iconId?: string;
}

const challengeDetailsBySlug: Record<string, ChallengeDetails> = {
  gym: {
    duration: "30 days",
    status: "Active",
    stake: "Reward: The loser buys the winner a PopMart figure.",
    participantOne: {
      name: "User A",
      goal: "Gym 5 Times Per Week"
    },
    participantTwo: {
      name: "User B",
      goal: "Going to the gym 3 times per week"
    },
    scoring:
      "Each participant logs activity during the week. If they meet their personal weekly goal, they earn 1 point for that week.",
    iconId: "icon-dumbbell"
  },
  mindfulness: {
    duration: "4 weeks",
    status: "Active",
    stake: "Punishment: The loser gets pied by the winner.",
    participantOne: {
      name: "User A",
      goal: "Meditating daily"
    },
    participantTwo: {
      name: "User B",
      goal: "Journaling daily"
    },
    scoring:
      "Both users log once per day. At the end of each week, they either pass or fail their goal for that week.",
    iconId: "icon-meditation"
  }
};

export function inferChallengeSlug(
  challenge: Partial<Challenge> | undefined
): string | undefined {
  if (!challenge) return undefined;

  const haystack = [
    challenge.id,
    challenge.title,
    challenge.description,
    challenge.link
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (haystack.includes("mind")) return "mindfulness";
  if (haystack.includes("gym")) return "gym";

  return undefined;
}

export function getChallengeDetails(
  challenge: Partial<Challenge> | undefined
): ChallengeDetails {
  if (
    challenge?.duration ||
    challenge?.status ||
    challenge?.stake ||
    challenge?.participantOneGoal ||
    challenge?.scoring
  ) {
    return {
      duration: challenge.duration || "Custom duration",
      status: challenge.status || "Active",
      stake: challenge.stake || "Friendly bragging rights.",
      participantOne: {
        name: challenge.owner || "You",
        goal: challenge.participantOneGoal || "Set a weekly goal"
      },
      participantTwo: {
        name: challenge.teammateUsername || "Coming Soon",
        goal: challenge.teammateAccepted
          ? "Track your own daily check-ins."
          : "Invite another participant later"
      },
      scoring:
        challenge.scoring ||
        "Participants earn a point when they complete their agreed-upon goal for the week."
    };
  }

  const slug = inferChallengeSlug(challenge);

  return (
    (slug && challengeDetailsBySlug[slug]) || {
      duration: "Custom duration",
      status: "Active",
      stake: "Friendly bragging rights.",
      participantOne: {
        name: "Player One",
        goal: "Set a weekly goal"
      },
      participantTwo: {
        name: "Player Two",
        goal: "Keep pace and stay consistent"
      },
      scoring:
        "Participants earn a point when they complete their agreed-upon goal for the week."
    }
  );
}

export function getChallengeIconHref(
  challenge: Partial<Challenge> | undefined
): string | undefined {
  const details = getChallengeDetails(challenge);

  return details.iconId
    ? `/icons/challenges.svg#${details.iconId}`
    : undefined;
}

export function escapeHtml(value: string | undefined): string {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
