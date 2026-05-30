import { fromAuth } from "@unbndl/auth";
import { createViewModel } from "@unbndl/view";
import { escapeHtml } from "../challenge-meta";

interface CreateChallengeState {
  authenticated: boolean;
  token?: string;
  title: string;
  description: string;
  duration: string;
  stake: string;
  participantOneGoal: string;
  scoring: string;
  image: string;
  submitting: boolean;
  error?: string;
}

export class CreateChallengeViewElement extends HTMLElement {
  viewModel = createViewModel<CreateChallengeState>({
    authenticated: false,
    token: undefined,
    title: "",
    description: "",
    duration: "",
    stake: "",
    participantOneGoal: "",
    scoring: "",
    image: "",
    submitting: false,
    error: undefined
  }).with(fromAuth(this), "authenticated", "token");

  constructor() {
    super();

    this.viewModel.createEffect(($) => this.render($));
  }

  connectedCallback() {
    this.render(this.viewModel.toObject());
    this.addEventListener("submit", this.handleSubmit);
  }

  disconnectedCallback() {
    this.removeEventListener("submit", this.handleSubmit);
  }

  render(state: CreateChallengeState) {
    this.innerHTML = `
      <main class="page-grid create-page">
        <section class="content-card challenge-form-shell grid-span-12">
          <div class="challenge-form-intro">
            <p class="header-kicker">Create</p>
            <span class="challenge-form-badge">Step 1 of 2</span>
          </div>
          <h2 class="challenge-form-title">Start a New Challenge</h2>
          <p class="challenge-form-copy">
            Fill out the basics for your own habit challenge. We can add a
            second participant later.
          </p>
          <form class="challenge-form">
            <label class="form-field">
              <span class="field-label">Challenge Title</span>
              <input
                name="title"
                placeholder="Morning Run Challenge"
                required
                value="${escapeHtml(state.title)}" />
              <small class="field-note">
                Pick a name you will recognize quickly on the dashboard.
              </small>
            </label>

            <label class="form-field">
              <span class="field-label">Description</span>
              <textarea
                name="description"
                rows="4"
                placeholder="Track a consistent habit and keep yourself accountable."
                required>${escapeHtml(state.description)}</textarea>
              <small class="field-note">
                One or two sentences is enough here.
              </small>
            </label>

            <div class="form-row">
              <label class="form-field">
                <span class="field-label">Duration</span>
                <input
                  name="duration"
                  placeholder="30 days"
                  required
                  value="${escapeHtml(state.duration)}" />
              </label>

              <label class="form-field">
                <span class="field-label">Stake</span>
                <input
                  name="stake"
                  placeholder="Winner picks the next dinner spot"
                  required
                  value="${escapeHtml(state.stake)}" />
              </label>
            </div>

            <label class="form-field">
              <span class="field-label">Your Goal</span>
              <input
                name="participantOneGoal"
                placeholder="Go to the gym 4 times per week"
                required
                value="${escapeHtml(state.participantOneGoal)}" />
              <small class="field-note">
                Describe the specific habit you want to track.
              </small>
            </label>

            <label class="form-field">
              <span class="field-label">Scoring Rules</span>
              <textarea
                name="scoring"
                rows="4"
                placeholder="Earn one point for each week the goal is completed."
                required>${escapeHtml(state.scoring)}</textarea>
              <small class="field-note">
                Explain how someone earns points or counts success.
              </small>
            </label>

            <label class="form-field">
              <span class="field-label">Image Filename or URL</span>
              <input
                name="image"
                placeholder="gym-challenge-mobile.png"
                value="${escapeHtml(state.image)}" />
              <small class="field-note">
                Optional. You can use an existing image filename or paste a URL.
              </small>
            </label>
            ${
              state.error
                ? `<p class="form-status error-text">${escapeHtml(
                    state.error
                  )}</p>`
                : ""
            }
            <div class="form-actions">
              <button
                type="submit"
                class="primary-button"
                ${state.submitting ? "disabled" : ""}>
                ${state.submitting ? "Creating..." : "Create Challenge"}
              </button>
              <a href="/app" class="secondary-link">Cancel</a>
            </div>
          </form>
        </section>

        <section class="content-card challenge-helper-card grid-span-12">
          <p class="header-kicker">Preview</p>
          <h2>What You’re Saving</h2>
          <p>
            Each challenge now stores its own title, description, duration,
            stake, goal, and scoring notes instead of relying only on the
            hardcoded examples.
          </p>
          <ul class="sequence-list helper-list">
            <li class="sequence-item">Title and short description</li>
            <li class="sequence-item">A duration and scoring plan</li>
            <li class="sequence-item">Your personal habit goal</li>
            <li class="sequence-item">An optional image reference</li>
          </ul>
        </section>
      </main>
    `;
  }

  handleSubmit = async (event: Event) => {
    event.preventDefault();

    const token = this.viewModel.$.token;

    if (!token) {
      this.viewModel.set("error", "You must be signed in to create a challenge.");
      return;
    }

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const duration = String(formData.get("duration") || "").trim();
    const stake = String(formData.get("stake") || "").trim();
    const participantOneGoal = String(
      formData.get("participantOneGoal") || ""
    ).trim();
    const scoring = String(formData.get("scoring") || "").trim();
    const image = String(formData.get("image") || "").trim();

    this.viewModel.update({
      title,
      description,
      duration,
      stake,
      participantOneGoal,
      scoring,
      image,
      submitting: true,
      error: undefined
    });

    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          duration,
          stake,
          participantOneGoal,
          scoring,
          image
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const challenge = await response.json();
      window.location.assign(challenge.link || `/app/challenges/${challenge.id}`);
    } catch (error) {
      this.viewModel.update({
        submitting: false,
        error: `Could not create challenge: ${String(error)}`
      });
    }
  };
}
