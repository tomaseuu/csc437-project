import { css, shadow } from "@unbndl/html";
import { fromAuth } from "@unbndl/auth";
import { Store } from "@unbndl/store";
import { createViewModel } from "@unbndl/view";
import { Challenge } from "server/models";
import { Msg } from "../messages";
import {
  escapeHtml,
  getChallengeDetails,
} from "../challenge-meta";

interface ChallengeState {
  authenticated: boolean;
  token?: string;
  username?: string;
  challengeId: string;
  loading: boolean;
  error?: string;
  challenge?: Challenge;
}

export class ChallengeViewElement extends HTMLElement {
  static observedAttributes = ["challenge-id"];

  static styles = css`
    :host {
      display: block;
    }

    main {
      width: min(100% - 2rem, 72rem);
      margin: 0 auto;
      padding: 2rem 0 3rem;
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 1.5rem;
    }

    section,
    article {
      box-sizing: border-box;
    }

    .hero-card,
    .dashboard-card,
    .detail-card,
    .loading-card,
    .error-card {
      border: 1px solid var(--color-border-strong);
      border-radius: 18px;
      background: var(--color-background-surface);
      box-shadow: 0 0.7rem 1.6rem var(--color-shadow);
    }

    .hero-card {
      grid-column: span 12;
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      justify-content: space-between;
      gap: 1.5rem;
      padding: clamp(1.5rem, 4vw, 2.5rem);
      background:
        linear-gradient(
          135deg,
          var(--color-gradient-a),
          var(--color-gradient-b)
        ),
        var(--color-background-surface);
    }

    .hero-copy {
      display: grid;
      gap: 0.75rem;
      max-width: 42rem;
    }

    .dashboard-card {
      grid-column: span 8;
      display: grid;
      gap: 1.25rem;
      padding: clamp(1.25rem, 3vw, 1.85rem);
    }

    .result-card {
      grid-column: span 12;
      display: grid;
      gap: 0.85rem;
      padding: clamp(1.25rem, 3vw, 1.75rem);
      border: 1px solid var(--color-border-strong);
      border-radius: 18px;
      background:
        radial-gradient(
          circle at top right,
          var(--color-gradient-c),
          transparent 35%
        ),
        var(--color-background-surface);
      box-shadow: 0 0.7rem 1.6rem var(--color-shadow);
    }

    .detail-card,
    .loading-card,
    .error-card {
      display: grid;
      gap: 0.9rem;
      padding: clamp(1.25rem, 3vw, 1.75rem);
    }

    .snapshot-card {
      grid-column: span 4;
    }

    .goal-card,
    .participants-card,
    .scoring-card {
      grid-column: span 6;
    }

    .loading-card,
    .error-card {
      grid-column: span 12;
    }

    .kicker {
      margin: 0;
      font-size: 0.88rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text-kicker);
    }

    h1,
    h2 {
      margin: 0;
      color: var(--color-text);
      font-family: "Roboto Slab", Georgia, serif;
      font-weight: 700;
    }

    h1 {
      font-size: clamp(2.2rem, 5vw, 3.5rem);
      line-height: 1.02;
      color: var(--color-primary);
    }

    h2 {
      font-size: 1.6rem;
      line-height: 1.12;
    }

    p {
      margin: 0;
      color: var(--color-text);
      line-height: 1.55;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--color-button-secondary-border);
      border-radius: 999px;
      padding: 0.85rem 1.15rem;
      background: var(--color-button-secondary-bg);
      color: var(--color-button-secondary-text);
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 0.35rem 1rem var(--color-shadow-medium);
      transition:
        transform 120ms ease,
        box-shadow 120ms ease,
        background-color 120ms ease;
    }

    .back-link:hover,
    .back-link:focus-visible {
      background: var(--color-button-secondary-bg-hover);
      box-shadow: 0 0.55rem 1.15rem var(--color-shadow-strong);
      transform: translateY(-1px);
    }

    .section-heading {
      display: flex;
      flex-wrap: wrap;
      align-items: start;
      justify-content: space-between;
      gap: 1rem;
    }

    .progress-copy {
      display: grid;
      gap: 0.45rem;
    }

    .progress-text {
      margin: 0;
      font-weight: 700;
      color: var(--color-text-subtle);
    }

    .progress-bar {
      width: 100%;
      height: 0.95rem;
      border-radius: 999px;
      background: var(--color-progress-track);
      overflow: hidden;
    }

    .progress-bar span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--color-primary), var(--color-accent-strong));
    }

    .day-tracker {
      display: flex;
      flex-wrap: wrap;
      gap: 0.85rem;
    }

    .day-chip {
      min-width: 8.8rem;
      display: grid;
      gap: 0.25rem;
      padding: 0.95rem 1rem;
      border-radius: 14px;
      font: inherit;
      text-align: left;
    }

    .day-chip span {
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .day-chip strong {
      font-size: 1rem;
    }

    .day-chip.is-complete {
      border: 1px solid var(--color-border-strong);
      background: var(--color-success-soft);
      color: var(--color-success);
    }

    .day-chip.is-missed {
      border: 1px dashed var(--color-border-soft);
      background: var(--color-background-surface-muted);
      color: var(--color-text-subtle);
    }

    .day-chip.is-active {
      border: 1px solid var(--color-button-secondary-border);
      background: var(--color-background-surface);
      color: var(--color-text);
      box-shadow: 0 0.45rem 1rem var(--color-shadow-medium);
      cursor: pointer;
      transition:
        transform 120ms ease,
        box-shadow 120ms ease,
        background-color 120ms ease;
    }

    .day-chip.is-active:hover,
    .day-chip.is-active:focus-visible {
      background: var(--color-background-surface-muted);
      box-shadow: 0 0.65rem 1.2rem var(--color-shadow-strong);
      transform: translateY(-1px);
    }

    .tracker-note {
      margin: 0;
      color: var(--color-text-subtle);
    }

    .tracker-success {
      color: var(--color-success);
      font-weight: 700;
    }

    .snapshot-list {
      display: grid;
      gap: 0.85rem;
      margin: 0;
    }

    .snapshot-list div {
      display: grid;
      gap: 0.2rem;
      padding: 0.85rem 0.95rem;
      border: 1px solid var(--color-border-soft);
      border-radius: 12px;
      background: var(--color-background-surface-muted);
    }

    dt {
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text-subtle);
    }

    dd {
      margin: 0;
      font-weight: 700;
      color: var(--color-text);
    }

    .participants-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.9rem;
    }

    .participant-panel {
      display: grid;
      gap: 0.45rem;
      padding: 1rem;
      border: 1px solid var(--color-border-soft);
      border-radius: 14px;
      background: var(--color-background-surface-muted);
    }

    .participant-panel strong {
      font-size: 1.2rem;
      color: var(--color-text);
    }

    .participant-panel .status-pill {
      justify-self: start;
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 0.3rem 0.65rem;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: var(--color-background-surface-soft);
      color: var(--color-text-subtle);
    }

    .participant-panel.is-leading {
      border-color: var(--color-border-strong);
      box-shadow: inset 0 0 0 1px var(--color-border-strong);
    }

    @media (max-width: 900px) {
      main {
        width: min(100% - 1.25rem, 72rem);
        grid-template-columns: repeat(8, minmax(0, 1fr));
      }

      .dashboard-card,
      .result-card,
      .hero-card,
      .loading-card,
      .error-card {
        grid-column: span 8;
      }

      .snapshot-card,
      .participants-card,
      .goal-card,
      .scoring-card {
        grid-column: span 4;
      }
    }

    @media (max-width: 640px) {
      main {
        padding: 1.25rem 0 2rem;
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .hero-card,
      .dashboard-card,
      .result-card,
      .detail-card,
      .loading-card,
      .error-card {
        grid-column: span 4;
        border-radius: 16px;
      }

      .day-chip {
        width: 100%;
      }
    }
  `;

  viewModel = createViewModel<ChallengeState>({
    authenticated: false,
    token: undefined,
    username: undefined,
    challengeId: "",
    loading: false,
    error: undefined,
    challenge: undefined,
  }).with(fromAuth(this), "authenticated", "token", "username");

  root = shadow(this)
    .styles(ChallengeViewElement.styles)
    .listen({
      click: (event: Event) => this.handleClick(event),
    });

  loadedKey?: string;

  constructor() {
    super();

    this.viewModel.createEffect(($) => {
      this.render($);

      const nextKey =
        $.authenticated && $.token && $.challengeId
          ? `${$.token}:${$.challengeId}`
          : undefined;

      if (nextKey && nextKey !== this.loadedKey) {
        this.loadChallenge($.challengeId, $.token as string);
      }
    });
  }

  connectedCallback() {
    this.viewModel.set("challengeId", this.getAttribute("challenge-id") || "");
    this.render(this.viewModel.toObject());
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ) {
    if (name === "challenge-id") {
      this.loadedKey = undefined;
      this.viewModel.update({
        challengeId: newValue || "",
        challenge: undefined,
        error: undefined,
      });
    }
  }

  async loadChallenge(id: string, token: string) {
    this.loadedKey = `${token}:${id}`;
    this.viewModel.update({
      loading: true,
      error: undefined,
    });

    try {
      const response = await fetch(`/api/challenges/${encodeURIComponent(id)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const challenge = (await response.json()) as Challenge;

      Store.dispatch(this, ["challenge/select", { challenge }] as Msg);

      this.viewModel.update({
        loading: false,
        challenge,
      });
    } catch (error) {
      this.loadedKey = undefined;
      this.viewModel.update({
        loading: false,
        error: `Could not load challenge: ${String(error)}`,
      });
    }
  }

  render(state: ChallengeState) {
    const main = document.createElement("main");

    if (state.loading) {
      main.innerHTML = `
        <section class="loading-card">
          <p class="kicker">Loading</p>
          <h2>Opening your dashboard...</h2>
        </section>
      `;
      this.root.replace(main);
      return;
    }

    if (state.error) {
      main.innerHTML = `
        <section class="error-card">
          <p class="kicker">Challenge Dashboard</p>
          <h2>We could not load this challenge.</h2>
          <p>${escapeHtml(state.error)}</p>
          <a class="back-link" href="/app/challenges">Back to your challenges</a>
        </section>
      `;
      this.root.replace(main);
      return;
    }

    if (!state.challenge) {
      main.innerHTML = `
        <section class="loading-card">
          <p class="kicker">Dashboard</p>
          <h2>Select a challenge to open its dashboard.</h2>
        </section>
      `;
      this.root.replace(main);
      return;
    }

    const challenge = state.challenge;
    const details = getChallengeDetails(challenge);
    const totalDays = parseDurationToDays(details.duration);
    const todayKey = getTodayKey();
    const startedOn = challenge.startedOn || todayKey;
    const currentDayIndex = getCurrentDayIndex(startedOn, todayKey);
    const isChallengeOver = currentDayIndex > totalDays;
    const daysRemaining = Math.max(0, totalDays - currentDayIndex + 1);
    const yourProgress = getParticipantProgress(challenge, state.username);
    const teammateProgress = getOpponentProgress(challenge, state.username);
    const completedDays = Math.min(yourProgress.completedDays, totalDays);
    const canCompleteToday =
      !isChallengeOver &&
      completedDays < totalDays &&
      yourProgress.lastCompletedOn !== todayKey;
    const nextDay = Math.min(completedDays + 1, totalDays);
    const visibleDays = isChallengeOver
      ? totalDays
      : completedDays + (canCompleteToday ? 1 : 0);
    const progressPercent = Math.round((completedDays / totalDays) * 100);
    const yourName =
      state.username || details.participantOne.name || "You";
    const teammateName =
      challenge.teammateUsername ||
      details.participantTwo.name ||
      "Teammate";
    const teammateReady = Boolean(
      challenge.teammateUsername && challenge.teammateAccepted,
    );
    const challengeEndsOn = formatDateLabel(
      getChallengeEndKey(startedOn, totalDays),
    );
    const youLead = completedDays > teammateProgress.completedDays;
    const teammateLeads = teammateProgress.completedDays > completedDays;
    const isTie = completedDays === teammateProgress.completedDays;
    const youWon = isChallengeOver && teammateReady && completedDays > teammateProgress.completedDays;
    const teammateWon = isChallengeOver && teammateReady && teammateProgress.completedDays > completedDays;
    const outcomeHeadline = !isChallengeOver
      ? "Keep showing up one day at a time."
      : !teammateReady
        ? "Your challenge window is complete."
        : youWon
          ? "You won this challenge."
          : teammateWon
            ? `${teammateName} won this challenge.`
            : "This challenge ended in a tie.";
    const outcomeSummary = !isChallengeOver
      ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining before the final count.`
      : !teammateReady
        ? `The ${totalDays}-day challenge ended on ${challengeEndsOn}. You finished ${completedDays} day${completedDays === 1 ? "" : "s"} and can use the stake however you want.`
        : youWon
          ? `Final score: ${completedDays} to ${teammateProgress.completedDays}. Reward: ${details.stake}`
          : teammateWon
            ? `Final score: ${teammateProgress.completedDays} to ${completedDays}. Reward: ${details.stake}`
            : `You both finished with ${completedDays} day${completedDays === 1 ? "" : "s"}. Reward: ${details.stake}`;

    main.innerHTML = `
      <section class="hero-card">
        <div class="hero-copy">
          <p class="kicker">Dashboard</p>
          <h1>${escapeHtml(challenge.title)}</h1>
          <p>${escapeHtml(challenge.description)}</p>
        </div>
        <a class="back-link" href="/app/challenges">Back to your challenges</a>
      </section>

      <section class="result-card">
        <p class="kicker">${isChallengeOver ? "Final Result" : "Challenge Clock"}</p>
        <h2>${escapeHtml(outcomeHeadline)}</h2>
        <p>${escapeHtml(outcomeSummary)}</p>
      </section>

      <section class="dashboard-card">
        <div class="section-heading">
          <div class="progress-copy">
            <p class="kicker">Daily Progress</p>
            <h2>Check off one day at a time.</h2>
          </div>
          <p class="progress-text">
            ${completedDays} of ${totalDays} days completed
          </p>
        </div>

        <div
          class="progress-bar"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="${totalDays}"
          aria-valuenow="${completedDays}">
          <span style="width: ${progressPercent}%"></span>
        </div>

        <div class="day-tracker">
          ${Array.from({ length: visibleDays }, (_, index) => {
            const day = index + 1;

            if (day <= completedDays) {
              return `
                <div class="day-chip is-complete">
                  <span>Day ${day}</span>
                  <strong>Done</strong>
                </div>
              `;
            }

            if (isChallengeOver) {
              return `
                <div class="day-chip is-missed">
                  <span>Day ${day}</span>
                  <strong>Missed</strong>
                </div>
              `;
            }

            return `
              <button
                type="button"
                class="day-chip is-active"
                data-action="complete-day">
                <span>Day ${day}</span>
                <strong>Mark Complete</strong>
              </button>
            `;
          }).join("")}
        </div>

        ${
          isChallengeOver
            ? `
              <p class="tracker-note tracker-success">
                This challenge ended on ${escapeHtml(challengeEndsOn)}. Final totals are locked in now.
              </p>
            `
            : completedDays >= totalDays
            ? `
              <p class="tracker-note tracker-success">
                You finished every day in this challenge. Nice work.
              </p>
            `
            : canCompleteToday
              ? `
                <p class="tracker-note">
                  Today’s check-in is ready. When you finish your habit, mark
                  Day ${nextDay} complete.
                </p>
              `
              : `
                <p class="tracker-note">
                  You already checked in today. Day ${nextDay} unlocks
                  tomorrow.
                </p>
              `
        }
      </section>

      <section class="detail-card snapshot-card">
        <p class="kicker">Overview</p>
        <h2>Challenge Snapshot</h2>
        <dl class="snapshot-list">
          <div>
            <dt>Duration</dt>
            <dd>${escapeHtml(details.duration)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>${escapeHtml(isChallengeOver ? "Completed" : details.status)}</dd>
          </div>
          <div>
            <dt>Stakes</dt>
            <dd>${escapeHtml(details.stake)}</dd>
          </div>
          <div>
            <dt>Ends On</dt>
            <dd>${escapeHtml(challengeEndsOn)}</dd>
          </div>
        </dl>
      </section>

      <section class="detail-card participants-card">
        <p class="kicker">Participants</p>
        <h2>Who is ahead right now</h2>
        <div class="participants-grid">
          <article class="participant-panel ${youLead ? "is-leading" : ""}">
            <p class="kicker">You</p>
            <strong>${escapeHtml(yourName)}</strong>
            <p>${completedDays} of ${totalDays} day${totalDays === 1 ? "" : "s"} checked in</p>
            <span class="status-pill">
              ${
                isChallengeOver && teammateReady
                  ? youWon
                    ? "Winner"
                    : isTie
                      ? "Tie"
                      : "Runner-Up"
                  : completedDays >= totalDays
                    ? "Finished"
                    : youLead
                      ? "Leading"
                      : "In Progress"
              }
            </span>
          </article>

          <article class="participant-panel ${teammateLeads ? "is-leading" : ""}">
            <p class="kicker">Teammate</p>
            <strong>${escapeHtml(teammateName)}</strong>
            <p>${
              teammateReady
                ? `${teammateProgress.completedDays} of ${totalDays} days checked in`
                : "Waiting for invite acceptance"
            }</p>
            <span class="status-pill">
              ${
                teammateReady
                  ? isChallengeOver
                    ? teammateWon
                      ? "Winner"
                      : isTie
                        ? "Tie"
                        : "Runner-Up"
                    : teammateProgress.completedDays >= totalDays
                      ? "Finished"
                      : teammateLeads
                        ? "Leading"
                        : "In Progress"
                  : "Pending"
              }
            </span>
          </article>
        </div>
      </section>

      <section class="detail-card goal-card">
        <p class="kicker">Your Goal</p>
        <h2>What you are tracking</h2>
        <p>${escapeHtml(details.participantOne.goal)}</p>
      </section>

      <section class="detail-card scoring-card">
        <p class="kicker">Scoring</p>
        <h2>How success works</h2>
        <p>${escapeHtml(details.scoring)}</p>
      </section>
    `;

    this.root.replace(main);
  }

  handleClick(event: Event) {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>("[data-action='complete-day']");

    if (!button) return;

    this.completeDay();
  }

  async completeDay() {
    const state = this.viewModel.toObject();

    if (!state.challenge || !state.token) return;

    const totalDays = parseDurationToDays(
      getChallengeDetails(state.challenge).duration,
    );
    const progress = getParticipantProgress(state.challenge, state.username);
    const completedDays = Math.min(progress.completedDays, totalDays);

    if (
      completedDays >= totalDays ||
      progress.lastCompletedOn === getTodayKey() ||
      isChallengeFinished(state.challenge, totalDays, getTodayKey())
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/challenges/${encodeURIComponent(state.challenge.id)}/checkin`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const challenge = (await response.json()) as Challenge;

      Store.dispatch(this, ["challenge/select", { challenge }] as Msg);
      Store.dispatch(this, ["challenges/request", {}] as Msg);

      this.viewModel.update({
        challenge,
        error: undefined,
      });
    } catch (error) {
      this.viewModel.set(
        "error",
        `Could not save today's check-in: ${String(error)}`,
      );
    }
  }
}

function parseDurationToDays(duration: string): number {
  const match = duration.match(/(\d+)/);
  const amount = match ? Number(match[1]) : 7;
  const lower = duration.toLowerCase();

  if (lower.includes("week")) {
    return Math.max(1, Math.min(amount * 7, 365));
  }

  if (lower.includes("month")) {
    return Math.max(1, Math.min(amount * 30, 365));
  }

  return Math.max(1, Math.min(amount, 365));
}

function getParticipantProgress(
  challenge: Challenge,
  username: string | undefined,
): { completedDays: number; lastCompletedOn?: string } {
  const isOwner = challenge.owner === username;

  return {
    completedDays: Math.max(
      0,
      Number(isOwner ? challenge.ownerCompletedDays : challenge.teammateCompletedDays) || 0,
    ),
    lastCompletedOn: isOwner
      ? challenge.ownerLastCompletedOn
      : challenge.teammateLastCompletedOn,
  };
}

function getOpponentProgress(
  challenge: Challenge,
  username: string | undefined,
): { completedDays: number; lastCompletedOn?: string } {
  const isOwner = challenge.owner === username;

  return {
    completedDays: Math.max(
      0,
      Number(isOwner ? challenge.teammateCompletedDays : challenge.ownerCompletedDays) || 0,
    ),
    lastCompletedOn: isOwner
      ? challenge.teammateLastCompletedOn
      : challenge.ownerLastCompletedOn,
  };
}

function isChallengeFinished(
  challenge: Challenge,
  totalDays: number,
  todayKey: string,
): boolean {
  const startedOn = challenge.startedOn || todayKey;
  return getCurrentDayIndex(startedOn, todayKey) > totalDays;
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

function getChallengeEndKey(startedOn: string, totalDays: number): string {
  const startedAt = new Date(`${startedOn}T00:00:00`);

  if (Number.isNaN(startedAt.getTime())) {
    return startedOn;
  }

  startedAt.setDate(startedAt.getDate() + totalDays - 1);

  const year = startedAt.getFullYear();
  const month = String(startedAt.getMonth() + 1).padStart(2, "0");
  const day = String(startedAt.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateKey;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTodayKey(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
