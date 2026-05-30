import { fromAuth } from "@unbndl/auth";
import { Store, fromStore } from "@unbndl/store";
import { BrowserHistory } from "@unbndl/switch";
import { css, html, shadow } from "@unbndl/html";
import { createViewModel } from "@unbndl/view";
import { Challenge } from "server/models";
import { escapeHtml } from "../challenge-meta";
import { Model } from "../model";
import { Msg } from "../messages";

interface CreateChallengeState {
  authenticated: boolean;
  token?: string;
  title: string;
  description: string;
  duration: string;
  stake: string;
  participantOneGoal: string;
  scoring: string;
  teammateUsername: string;
  creatingChallenge: boolean;
  createdChallenge?: Challenge;
  createChallengeError?: string;
  error?: string;
}

export class CreateChallengeViewElement extends HTMLElement {
  static styles = css`
    :host {
      display: block;
    }

    main {
      min-height: 100%;
      display: grid;
      justify-items: center;
      gap: 1.5rem;
      padding: 2rem 1rem 3rem;
    }

    section {
      width: min(100%, 48rem);
      display: grid;
      gap: 1rem;
      padding: clamp(1.25rem, 3vw, 2rem);
      border: 1px solid var(--color-border-strong);
      border-radius: 16px;
      background: var(--color-background-surface);
      box-shadow: 0 0.6rem 1.5rem var(--color-shadow);
    }

    .header-kicker {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .challenge-form-intro {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .challenge-form-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.35rem 0.75rem;
      border: 1px solid var(--color-border-strong);
      border-radius: 999px;
      background: var(--color-background-surface-soft);
      color: var(--color-primary);
      font-size: 0.9rem;
      font-weight: 700;
    }

    h2 {
      margin: 0;
      color: var(--color-text);
      font-family: "Roboto Slab", Georgia, serif;
      font-size: 1.7rem;
    }

    .challenge-form-title {
      color: var(--color-primary);
      font-size: clamp(2rem, 5vw, 3rem);
      text-align: center;
    }

    .challenge-form-copy {
      margin: 0 auto;
      max-width: 34rem;
      text-align: center;
    }

    form {
      display: grid;
      gap: 1.25rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
      align-items: start;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      justify-content: flex-start;
    }

    .form-row > label {
      align-self: start;
    }

    .field-label {
      font-size: 1rem;
      font-weight: 700;
    }

    input,
    textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 1rem 1.1rem;
      border: 1px solid var(--color-border-strong);
      border-radius: 14px;
      background: var(--color-background-surface);
      color: var(--color-text);
      font: inherit;
    }

    textarea {
      min-height: 8rem;
      max-height: 16rem;
      resize: vertical;
    }

    input::placeholder,
    textarea::placeholder {
      color: var(--color-placeholder);
    }

    input:focus,
    textarea:focus {
      outline: 2px solid var(--color-focus);
      outline-offset: 1px;
      border-color: var(--color-focus);
    }

    small {
      color: var(--color-text-muted);
      font-size: 0.92rem;
    }

    .form-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0.85rem;
      padding-top: 0.25rem;
    }

    button {
      min-width: 14rem;
      border: 0;
      border-radius: 999px;
      padding: 1rem 1.4rem;
      background: var(--color-button-primary-bg);
      color: var(--color-button-primary-text);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.7;
      cursor: progress;
    }

    a {
      color: var(--color-text);
      font-weight: 700;
    }

    .form-status {
      margin: 0;
      text-align: center;
    }

    .error-text {
      color: var(--color-error);
    }

    .helper-list {
      display: grid;
      gap: 0.75rem;
      margin: 0;
      padding-left: 0;
      list-style: none;
    }

    .helper-list li {
      padding: 0.85rem 1rem;
      border: 1px solid var(--color-border-soft);
      border-radius: 12px;
      background: var(--color-background-surface-muted);
    }

    @media (max-width: 700px) {
      main {
        padding: 1.25rem 0.75rem 2rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      button {
        width: 100%;
      }
    }
  `;

  viewModel = createViewModel<CreateChallengeState>({
    authenticated: false,
    token: undefined,
    title: "",
    description: "",
    duration: "",
    stake: "",
    participantOneGoal: "",
    scoring: "",
    teammateUsername: "",
    creatingChallenge: false,
    createdChallenge: undefined,
    createChallengeError: undefined,
    error: undefined
  })
    .with(fromAuth(this), "authenticated", "token")
    .with(
      fromStore<Model>(this),
      "creatingChallenge",
      "createdChallenge",
      "createChallengeError"
    );

  lastCreatedId?: string;

  view = html`
    <main>
      <section>
        <p class="header-kicker">Preview</p>
        <h2>What You’re Saving</h2>
        <p>
          Each challenge now stores its own title, description, duration,
          stake, goal, and scoring notes instead of relying only on the
          hardcoded examples.
        </p>
        <ul class="helper-list">
          <li>Title and short description</li>
          <li>A duration and scoring plan</li>
          <li>Your personal habit goal</li>
        </ul>
      </section>

      <section>
        <div class="challenge-form-intro">
          <p class="header-kicker">Create</p>
          <span class="challenge-form-badge">Step 1 of 2</span>
        </div>
        <h2 class="challenge-form-title">Start a New Challenge</h2>
        <p class="challenge-form-copy">
          Fill out the basics for your own habit challenge. We can add a second
          participant later.
        </p>
        <form autocomplete="off">
          <label>
            <span class="field-label">Challenge Title</span>
            <input
              name="title"
              placeholder="Morning Run Challenge"
              required
              value=${($: CreateChallengeState) => $.title} />
            <small>
              Pick a name you will recognize quickly on the dashboard.
            </small>
          </label>

          <label>
            <span class="field-label">Description</span>
            <textarea
              name="description"
              rows="4"
              placeholder="Track a consistent habit and keep yourself accountable."
              required>${($: CreateChallengeState) => $.description}</textarea>
            <small>One or two sentences is enough here.</small>
          </label>

          <div class="form-row">
            <label>
              <span class="field-label">Duration</span>
              <input
                type="number"
                inputmode="numeric"
                min="1"
                step="1"
                name="duration"
                placeholder="30"
                required
                value=${($: CreateChallengeState) => $.duration} />
              <small>Enter the number of days for this challenge.</small>
            </label>

            <label>
              <span class="field-label">Stake</span>
              <input
                name="stake"
                placeholder="Winner picks the next dinner spot"
                required
                value=${($: CreateChallengeState) => $.stake} />
            </label>
          </div>

          <label>
            <span class="field-label">Your Goal</span>
            <input
              name="participantOneGoal"
              placeholder="Go to the gym 4 times per week"
              required
              value=${($: CreateChallengeState) => $.participantOneGoal} />
            <small>Describe the specific habit you want to track.</small>
          </label>

          <label>
            <span class="field-label">Scoring Rules</span>
            <textarea
              name="scoring"
              rows="4"
              placeholder="Earn one point for each week the goal is completed."
              required>${($: CreateChallengeState) => $.scoring}</textarea>
            <small>Explain how someone earns points or counts success.</small>
          </label>

          <label>
            <span class="field-label">Invite Teammate</span>
            <input
              name="teammateUsername"
              placeholder="Enter a teammate username"
              value=${($: CreateChallengeState) => $.teammateUsername} />
            <small>
              Optional. We will send this user an invite when you create the challenge.
            </small>
          </label>

          ${($: CreateChallengeState) =>
            $.error || $.createChallengeError
              ? `<p class="form-status error-text">${escapeHtml(
                  $.error || $.createChallengeError || ""
                )}</p>`
              : ""}

          <div class="form-actions">
            <button
              type="submit"
              ?disabled=${($: CreateChallengeState) => $.creatingChallenge}>
              ${($: CreateChallengeState) =>
                $.creatingChallenge ? "Creating..." : "Create Challenge"}
            </button>
            <a href="/app">Cancel</a>
          </div>
        </form>
      </section>
    </main>
  `;

  constructor() {
    super();

    const root = shadow(this)
      .styles(CreateChallengeViewElement.styles)
      .listen({
        submit: (event: Event) => this.handleSubmit(event)
      });

    this.viewModel.createEffect(() => {
      const state = this.viewModel.toObject();
      root.replace(this.viewModel.render(this.view));
      this.sanitizeRenderedFields();

      const challenge = state.createdChallenge;
      if (challenge?.id && challenge.id !== this.lastCreatedId) {
        this.lastCreatedId = challenge.id;
        Store.dispatch(this, ["challenge/create/reset", {}] as Msg);
        BrowserHistory.dispatch(this, "history/navigate", {
          href: challenge.link || `/app/challenges/${challenge.id}`,
        });
      }
    });
  }

  connectedCallback() {
    Store.dispatch(this, ["challenge/create/reset", {}] as Msg);
    this.addEventListener("input", this.handleInput);
  }

  disconnectedCallback() {
    this.removeEventListener("input", this.handleInput);
  }

  handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;

    if (!target?.name) return;

    const nextValue = sanitizePlainText(target.value);

    if (target.value !== nextValue) {
      target.value = nextValue;
    }

    this.viewModel.set(
      target.name as keyof CreateChallengeState,
      nextValue as never
    );
  };

  handleSubmit = async (event: Event) => {
    event.preventDefault();

    const token = this.viewModel.$.token;

    if (!token) {
      this.viewModel.set("error", "You must be signed in to create a challenge.");
      return;
    }

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const title = sanitizePlainText(String(formData.get("title") || "")).trim();
    const description = sanitizePlainText(
      String(formData.get("description") || "")
    ).trim();
    const duration = String(formData.get("duration") || "")
      .replace(/\D+/g, "")
      .trim();
    const stake = sanitizePlainText(String(formData.get("stake") || "")).trim();
    const participantOneGoal = sanitizePlainText(
      String(formData.get("participantOneGoal") || "")
    ).trim();
    const scoring = sanitizePlainText(
      String(formData.get("scoring") || "")
    ).trim();
    const teammateUsername = sanitizePlainText(
      String(formData.get("teammateUsername") || "")
    ).trim();

    if (!duration) {
      this.viewModel.update({
        error: "Duration must be a number of days."
      });
      return;
    }

    const normalizedDuration = `${duration} ${duration === "1" ? "day" : "days"}`;

    this.viewModel.update({
      title,
      description,
      duration,
      stake,
      participantOneGoal,
      scoring,
      teammateUsername,
      error: undefined
    });

    Store.dispatch(this, [
      "challenge/create",
      {
        challenge: {
          title,
          description,
          duration: normalizedDuration,
          stake,
          participantOneGoal,
          scoring,
          teammateUsername: teammateUsername || undefined,
        },
      },
    ] as Msg);
  };

  sanitizeRenderedFields() {
    const fields = this.shadowRoot?.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement
    >("input, textarea");

    fields?.forEach((field) => {
      const cleaned = sanitizePlainText(field.value);

      if (field.value !== cleaned) {
        field.value = cleaned;

        if (field.name) {
          this.viewModel.set(field.name as keyof CreateChallengeState, cleaned as never);
        }
      }
    });
  }
}

function sanitizePlainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\s{3,}/g, "  ");
}
