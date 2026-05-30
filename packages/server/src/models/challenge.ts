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
