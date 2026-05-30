import { fromAuth } from "@unbndl/auth";
import { css, shadow } from "@unbndl/html";
import { createViewModel } from "@unbndl/view";
import { Store, fromStore } from "@unbndl/store";
import { Challenge } from "server/models";
import { Model } from "../model";
import { Msg } from "../messages";
import { escapeHtml } from "../challenge-meta";

interface ChallengesState {
  authenticated: boolean;
  token?: string;
  username?: string;
  challenges?: Challenge[];
  deletingId?: string;
  error?: string;
}

export class ChallengesViewElement extends HTMLElement {
  static styles = css`
    :host {
      display: block;
    }

    main {
      width: min(100% - 2rem, 72rem);
      margin: 0 auto;
      padding: 2rem 0 3rem;
      display: grid;
      gap: 1.5rem;
    }

    section,
    article {
      box-sizing: border-box;
    }

    .hero-card,
    .empty-card,
    .loading-card,
    .challenge-card {
      border: 1px solid var(--color-border-strong);
      border-radius: 18px;
      background: var(--color-background-surface);
      box-shadow: 0 0.7rem 1.6rem var(--color-shadow);
    }

    .hero-card {
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
      font-size: 1.7rem;
      line-height: 1.1;
    }

    p {
      margin: 0;
      color: var(--color-text);
      line-height: 1.55;
    }

    .hero-actions {
      display: grid;
      gap: 0.75rem;
      justify-items: start;
    }

    .primary-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 13rem;
      border: 1px solid var(--color-button-secondary-border);
      border-radius: 999px;
      padding: 0.95rem 1.35rem;
      background: var(--color-button-primary-bg);
      color: var(--color-button-primary-text);
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 0.55rem 1.25rem var(--color-shadow-medium);
      transition:
        transform 120ms ease,
        box-shadow 120ms ease,
        background-color 120ms ease;
    }

    .primary-link:hover,
    .primary-link:focus-visible {
      background: var(--color-button-primary-bg-hover);
      box-shadow: 0 0.7rem 1.5rem var(--color-shadow-strong);
      transform: translateY(-1px);
    }

    .challenge-grid {
      display: grid;
      gap: 1.25rem;
    }

    .challenge-card {
      display: grid;
      grid-template-columns: minmax(0, 1.7fr) minmax(14rem, 1fr) auto;
      align-items: center;
      gap: 1.5rem;
      padding: clamp(1.25rem, 3vw, 1.75rem);
    }

    .challenge-card-copy {
      display: grid;
      gap: 0.55rem;
    }

    .challenge-card-meta {
      display: grid;
      gap: 0.75rem;
      margin: 0;
    }

    .challenge-card-meta div {
      display: grid;
      gap: 0.15rem;
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

    .card-actions {
      display: grid;
      gap: 0.75rem;
      justify-self: end;
    }

    .secondary-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 13rem;
      border: 1px solid var(--color-button-secondary-border);
      border-radius: 999px;
      padding: 0.95rem 1.35rem;
      background: var(--color-button-secondary-bg);
      color: var(--color-button-secondary-text);
      font: inherit;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 0.35rem 1rem var(--color-shadow-medium);
      transition:
        transform 120ms ease,
        box-shadow 120ms ease,
        background-color 120ms ease;
      cursor: pointer;
    }

    .secondary-button:hover,
    .secondary-button:focus-visible {
      background: var(--color-button-secondary-bg-hover);
      box-shadow: 0 0.55rem 1.15rem var(--color-shadow-strong);
      transform: translateY(-1px);
    }

    .secondary-button:disabled {
      opacity: 0.7;
      cursor: progress;
      transform: none;
    }

    .error-card {
      display: grid;
      gap: 0.6rem;
      padding: 1.25rem 1.5rem;
      border: 1px solid var(--color-border-strong);
      border-radius: 18px;
      background: var(--color-background-surface);
      box-shadow: 0 0.7rem 1.6rem var(--color-shadow);
    }

    .error-text {
      color: var(--color-error);
    }

    .empty-card,
    .loading-card {
      display: grid;
      gap: 0.85rem;
      padding: 2rem;
    }

    @media (max-width: 860px) {
      main {
        width: min(100% - 1.25rem, 72rem);
      }

      .challenge-card {
        grid-template-columns: 1fr;
      }

      .card-actions {
        justify-self: start;
      }
    }

    @media (max-width: 640px) {
      main {
        padding: 1.25rem 0 2rem;
      }

      .hero-card,
      .empty-card,
      .loading-card,
      .challenge-card {
        border-radius: 16px;
      }

      .primary-link {
        width: 100%;
      }
    }
  `;

  viewModel = createViewModel<ChallengesState>({
    authenticated: false,
    token: undefined,
    username: undefined,
    challenges: undefined,
    deletingId: undefined,
    error: undefined,
  })
    .with(fromAuth(this), "authenticated", "token", "username")
    .with(fromStore<Model>(this), "challenges");

  root = shadow(this)
    .styles(ChallengesViewElement.styles)
    .listen({
      click: (event: Event) => this.handleClick(event),
    });

  constructor() {
    super();

    this.viewModel.createEffect(($) => {
      this.render($);
    });
  }

  connectedCallback() {
    if (this.viewModel.$.challenges === undefined) {
      Store.dispatch(this, ["challenges/request", {}] as Msg);
    }
  }

  render(state: ChallengesState) {
    const main = document.createElement("main");

    main.innerHTML = `
      ${state.error ? `
        <section class="error-card">
          <p class="kicker">Challenges</p>
          <p class="error-text">${escapeHtml(state.error)}</p>
        </section>
      ` : ""}

      <section class="hero-card">
        <div class="hero-copy">
          <p class="kicker">Your Challenges</p>
          <h1>Pick a challenge and jump back into your routine.</h1>
          <p>
            Every challenge you create lives here. Open one to see its daily
            dashboard, or start a brand-new challenge when you are ready.
          </p>
        </div>

        <div class="hero-actions">
          <a class="primary-link" href="/app/create-challenge">
            Create Challenge
          </a>
        </div>
      </section>

      ${this.renderChallengeList(state)}
    `;

    this.root.replace(main);
  }

  renderChallengeList(state: ChallengesState): string {
    const challenges = state.challenges;

    if (challenges === undefined) {
      return `
        <section class="loading-card">
          <p class="kicker">Loading</p>
          <h2>Pulling in your challenges...</h2>
        </section>
      `;
    }

    if (!challenges.length) {
      return `
        <section class="empty-card">
          <p class="kicker">No Challenges Yet</p>
          <h2>Your first habit challenge starts here.</h2>
          <p>
            Create one challenge for yourself, then come back here to track it
            day by day.
          </p>
          <a class="primary-link" href="/app/create-challenge">
            Start Your First Challenge
          </a>
        </section>
      `;
    }

    const cards = challenges
      .map((challenge) => {
        return `
          <article class="challenge-card">
            <div class="challenge-card-copy">
              <p class="kicker">Active Challenge</p>
              <h2>${escapeHtml(challenge.title)}</h2>
              <p>${escapeHtml(challenge.description)}</p>
            </div>

            <dl class="challenge-card-meta">
              <div>
                <dt>Duration</dt>
                <dd>${escapeHtml(challenge.duration || "Custom")}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>${escapeHtml(challenge.status || "Active")}</dd>
              </div>
              <div>
                <dt>Your Goal</dt>
                <dd>${escapeHtml(challenge.participantOneGoal || "Set your goal")}</dd>
              </div>
            </dl>

            <div class="card-actions">
              <a
                class="primary-link"
                href="/app/challenges/${encodeURIComponent(challenge.id)}">
                Open Dashboard
              </a>
              ${
                challenge.owner === state.username
                  ? `
                    <button
                      type="button"
                      class="secondary-button"
                      data-action="delete-challenge"
                      data-id="${escapeHtml(challenge.id)}"
                      ${state.deletingId === challenge.id ? "disabled" : ""}>
                      ${state.deletingId === challenge.id ? "Deleting..." : "Delete"}
                    </button>
                  `
                  : ""
              }
            </div>
          </article>
        `;
      })
      .join("");

    return `<section class="challenge-grid">${cards}</section>`;
  }

  handleClick(event: Event) {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>("[data-action='delete-challenge']");

    if (!button) return;

    const challengeId = button.dataset.id;

    if (!challengeId) return;

    this.deleteChallenge(challengeId);
  }

  async deleteChallenge(challengeId: string) {
    const token = this.viewModel.$.token;

    if (!token) return;

    this.viewModel.update({
      deletingId: challengeId,
      error: undefined,
    });

    try {
      const response = await fetch(
        `/api/challenges/${encodeURIComponent(challengeId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      Store.dispatch(this, ["challenges/request", {}] as Msg);
      this.viewModel.update({
        deletingId: undefined,
        error: undefined,
      });
    } catch (error) {
      this.viewModel.update({
        deletingId: undefined,
        error: `Could not delete challenge: ${String(error)}`,
      });
    }
  }
}
