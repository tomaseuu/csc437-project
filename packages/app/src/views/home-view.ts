import { fromAuth } from "@unbndl/auth";
import { css, shadow } from "@unbndl/html";
import { Store } from "@unbndl/store";
import { createViewModel } from "@unbndl/view";
import { Challenge } from "server/models";
import { Msg } from "../messages";
import { escapeHtml } from "../challenge-meta";

interface HomeState {
  authenticated: boolean;
  token?: string;
  invites?: Challenge[];
  loadingInvites: boolean;
  inviteError?: string;
}

export class HomeViewElement extends HTMLElement {
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

    section {
      box-sizing: border-box;
    }

    .hero-card,
    .step-card,
    .invite-card,
    .invite-empty {
      border: 1px solid var(--color-border-strong);
      border-radius: 18px;
      background: var(--color-background-surface);
      box-shadow: 0 0.7rem 1.6rem var(--color-shadow);
    }

    .hero-card {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: clamp(1.5rem, 4vw, 2.75rem);
      background:
        radial-gradient(
          circle at top right,
          var(--color-gradient-c),
          transparent 35%
        ),
        linear-gradient(
          135deg,
          var(--color-gradient-a),
          var(--color-gradient-b)
        ),
        var(--color-background-surface);
    }

    .hero-copy,
    .invite-copy {
      display: grid;
      gap: 0.8rem;
    }

    .hero-copy {
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
    h2,
    h3 {
      margin: 0;
      color: var(--color-text);
      font-family: "Roboto Slab", Georgia, serif;
      font-weight: 700;
    }

    h1 {
      font-size: clamp(2.3rem, 5vw, 3.8rem);
      line-height: 0.98;
      color: var(--color-primary);
    }

    h2 {
      font-size: 1.5rem;
      line-height: 1.12;
    }

    h3 {
      font-size: 1.3rem;
      line-height: 1.15;
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
      min-width: 18rem;
    }

    .hero-links,
    .invite-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.85rem;
    }

    .primary-link,
    .secondary-link,
    .primary-button,
    .secondary-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 12.5rem;
      border-radius: 999px;
      padding: 0.95rem 1.35rem;
      font: inherit;
      font-weight: 700;
      text-decoration: none;
      transition:
        transform 120ms ease,
        box-shadow 120ms ease,
        background-color 120ms ease;
      cursor: pointer;
    }

    .primary-link,
    .primary-button {
      border: 1px solid var(--color-button-secondary-border);
      background: var(--color-button-primary-bg);
      color: var(--color-button-primary-text);
      box-shadow: 0 0.55rem 1.25rem var(--color-shadow-medium);
    }

    .primary-link:hover,
    .primary-link:focus-visible,
    .primary-button:hover,
    .primary-button:focus-visible {
      background: var(--color-button-primary-bg-hover);
      box-shadow: 0 0.7rem 1.5rem var(--color-shadow-strong);
      transform: translateY(-1px);
    }

    .secondary-link,
    .secondary-button {
      border: 1px solid var(--color-button-secondary-border);
      background: var(--color-button-secondary-bg);
      color: var(--color-button-secondary-text);
      box-shadow: 0 0.35rem 1rem var(--color-shadow-medium);
    }

    .secondary-link:hover,
    .secondary-link:focus-visible,
    .secondary-button:hover,
    .secondary-button:focus-visible {
      background: var(--color-button-secondary-bg-hover);
      box-shadow: 0 0.55rem 1.15rem var(--color-shadow-strong);
      transform: translateY(-1px);
    }

    .hero-note,
    .invite-note {
      font-size: 0.98rem;
      color: var(--color-text-subtle);
      max-width: 22rem;
    }

    .step-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.25rem;
    }

    .step-card,
    .invite-card,
    .invite-empty {
      display: grid;
      gap: 0.85rem;
      padding: clamp(1.25rem, 3vw, 1.75rem);
      align-content: start;
      min-height: 100%;
    }

    .invite-card {
      border-color: var(--color-border-soft);
      background: var(--color-background-surface-muted);
    }

    .invite-grid {
      display: grid;
      gap: 1rem;
    }

    .step-number {
      width: 2.4rem;
      height: 2.4rem;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--color-background-surface-soft);
      color: var(--color-primary);
      font-weight: 700;
    }

    .invite-meta {
      display: grid;
      gap: 0.3rem;
    }

    .invite-meta strong {
      color: var(--color-text);
    }

    .error-text {
      color: var(--color-error);
    }

    @media (max-width: 860px) {
      main {
        width: min(100% - 1.25rem, 72rem);
      }

      .step-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      main {
        padding: 1.25rem 0 2rem;
      }

      .hero-card,
      .step-card,
      .invite-card,
      .invite-empty {
        border-radius: 16px;
      }

      .hero-links,
      .invite-actions {
        width: 100%;
      }

      .primary-link,
      .secondary-link,
      .primary-button,
      .secondary-button {
        width: 100%;
      }

      .hero-actions {
        min-width: 0;
        width: 100%;
      }
    }
  `;

  viewModel = createViewModel<HomeState>({
    authenticated: false,
    token: undefined,
    invites: undefined,
    loadingInvites: false,
    inviteError: undefined,
  }).with(fromAuth(this), "authenticated", "token");

  root = shadow(this)
    .styles(HomeViewElement.styles)
    .listen({
      click: (event: Event) => this.handleClick(event),
    });

  loadedToken?: string;

  constructor() {
    super();

    this.viewModel.createEffect(($) => {
      this.render($);

      if ($.authenticated && $.token && $.token !== this.loadedToken) {
        this.loadedToken = $.token;
        this.loadInvites($.token);
      }
    });
  }

  connectedCallback() {
    this.render(this.viewModel.toObject());
  }

  render(state: HomeState) {
    const main = document.createElement("main");

    main.innerHTML = `
      ${this.renderInvites(state)}

      <section class="hero-card">
        <div class="hero-copy">
          <p class="kicker">Welcome</p>
          <h1>Build a habit challenge you can actually follow.</h1>
          <p>
            Consistently helps you turn one goal into a day-by-day routine.
            Set the challenge, track your progress, and keep moving forward
            one check-in at a time.
          </p>
        </div>

        <div class="hero-actions">
          <div class="hero-links">
            <a class="primary-link" href="/app/create-challenge">
              Get Started
            </a>
            <a class="secondary-link" href="/app/challenges">
              View Your Challenges
            </a>
          </div>
          <p class="hero-note">
            Start with one challenge, then keep coming back to your dashboard
            for the next daily check-in.
          </p>
        </div>
      </section>

      <section class="step-grid" aria-label="How Consistently works">
        <article class="step-card">
          <div class="step-number">1</div>
          <p class="kicker">Step 1</p>
          <h2>Create your challenge</h2>
          <p>
            Name your habit, choose how long you want to commit, and write down
            the goal you want to hit.
          </p>
        </article>

        <article class="step-card">
          <div class="step-number">2</div>
          <p class="kicker">Step 2</p>
          <h2>Invite your teammate</h2>
          <p>
            Send an invite by username so another person can join your challenge
            and accept it from their dashboard.
          </p>
        </article>

        <article class="step-card">
          <div class="step-number">3</div>
          <p class="kicker">Step 3</p>
          <h2>Stay consistent</h2>
          <p>
            Track your streak, finish the full challenge, and build a routine
            that feels steady instead of overwhelming.
          </p>
        </article>
      </section>
    `;

    this.root.replace(main);
  }

  renderInvites(state: HomeState): string {
    if (state.loadingInvites && state.invites === undefined) {
      return `
        <section class="invite-empty">
          <p class="kicker">Invites</p>
          <h2>Checking for teammate invites...</h2>
        </section>
      `;
    }

    if (state.inviteError) {
      return `
        <section class="invite-empty">
          <p class="kicker">Invites</p>
          <h2>We could not load your invites.</h2>
          <p class="error-text">${escapeHtml(state.inviteError)}</p>
        </section>
      `;
    }

    if (!state.invites?.length) {
      return "";
    }

    const cards = state.invites
      .map(
        (invite) => `
          <article class="invite-card">
            <div class="invite-copy">
              <p class="kicker">Invite Waiting</p>
              <h3>${escapeHtml(invite.title)}</h3>
              <p>${escapeHtml(invite.description)}</p>
            </div>
            <div class="invite-meta">
              <p><strong>From:</strong> ${escapeHtml(invite.owner || "Teammate")}</p>
              <p><strong>Duration:</strong> ${escapeHtml(invite.duration || "7 days")}</p>
              <p><strong>Your goal:</strong> Join the challenge and start checking in.</p>
            </div>
            <div class="invite-actions">
              <button
                type="button"
                class="primary-button"
                data-action="accept-invite"
                data-id="${escapeHtml(invite.id)}">
                Accept Invite
              </button>
            </div>
          </article>
        `
      )
      .join("");

    return `
      <section class="invite-grid" aria-label="Pending invites">
        ${cards}
      </section>
    `;
  }

  async loadInvites(token: string) {
    this.viewModel.update({
      loadingInvites: true,
      inviteError: undefined,
    });

    try {
      const response = await fetch("/api/challenges/invites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        this.viewModel.update({
          invites: [],
          loadingInvites: false,
          inviteError: undefined,
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const invites = (await response.json()) as Challenge[];

      this.viewModel.update({
        invites,
        loadingInvites: false,
      });
    } catch (error) {
      this.viewModel.update({
        loadingInvites: false,
        inviteError: String(error),
      });
    }
  }

  handleClick(event: Event) {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>("[data-action='accept-invite']");

    if (!button) return;

    const challengeId = button.dataset.id;

    if (!challengeId) return;

    this.acceptInvite(challengeId);
  }

  async acceptInvite(challengeId: string) {
    const token = this.viewModel.$.token;

    if (!token) return;

    try {
      const response = await fetch(
        `/api/challenges/${encodeURIComponent(challengeId)}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const challenge = (await response.json()) as Challenge;
      Store.dispatch(this, ["challenges/request", {}] as Msg);
      window.location.assign(challenge.link || `/app/challenges/${challenge.id}`);
    } catch (error) {
      this.viewModel.set("inviteError", `Could not accept invite: ${String(error)}`);
    }
  }
}
