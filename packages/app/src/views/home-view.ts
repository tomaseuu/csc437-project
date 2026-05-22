import { fromAuth } from "@unbndl/auth";
import { createViewModel } from "@unbndl/view";
import {
  Challenge,
  escapeHtml,
  getChallengeIconHref
} from "../challenge-meta";

interface HomeState {
  authenticated: boolean;
  token?: string;
  loading: boolean;
  error?: string;
  challenges: Challenge[];
}

export class HomeViewElement extends HTMLElement {
  viewModel = createViewModel<HomeState>({
    authenticated: false,
    token: undefined,
    loading: false,
    error: undefined,
    challenges: []
  }).with(fromAuth(this), "authenticated", "token");

  loadedToken?: string;

  constructor() {
    super();

    this.viewModel.createEffect(($) => {
      this.render($);

      if ($.authenticated && $.token && $.token !== this.loadedToken) {
        this.loadChallenges($.token);
      }
    });
  }

  connectedCallback() {
    this.render(this.viewModel.toObject());
  }

  async loadChallenges(token: string) {
    this.loadedToken = token;
    this.viewModel.update({
      loading: true,
      error: undefined
    });

    try {
      const response = await fetch("/api/challenges", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const challenges = (await response.json()) as Challenge[];

      this.viewModel.update({
        loading: false,
        challenges
      });
    } catch (error) {
      this.loadedToken = undefined;
      this.viewModel.update({
        loading: false,
        error: `Could not load challenges: ${String(error)}`
      });
    }
  }

  render(state: HomeState) {
    this.innerHTML = `
      <main class="page-grid">
        <section class="content-card grid-span-8">
          <h2>Challenge List</h2>
          ${this.renderChallengeList(state)}
        </section>

        <section class="content-card grid-span-4">
          <h2>About This Project</h2>
          <p>
            Users join challenges with friends, set personal habit goals, log
            progress, and earn points for completing successful weeks.
          </p>
          <p>
            This new Vite single-page app keeps the same proto design, but now
            uses client-side routing under <strong>/app</strong>.
          </p>
        </section>
      </main>
    `;
  }

  renderChallengeList(state: HomeState): string {
    if (state.loading) {
      return "<p>Loading challenges...</p>";
    }

    if (state.error) {
      return `<p>${escapeHtml(state.error)}</p>`;
    }

    if (!state.challenges.length) {
      return "<p>No challenges are available yet.</p>";
    }

    const items = state.challenges
      .map((challenge) => {
        const iconHref = getChallengeIconHref(challenge);
        const icon = iconHref
          ? `<svg class="icon" aria-hidden="true"><use href="${iconHref}"></use></svg>`
          : "";

        return `
          <li class="sequence-item">
            <div>
              <a href="/app/challenges/${encodeURIComponent(challenge.id)}">
                ${icon}
                ${escapeHtml(challenge.title)}
              </a>
              <p>${escapeHtml(challenge.description)}</p>
            </div>
          </li>
        `;
      })
      .join("");

    return `<ul class="sequence-list">${items}</ul>`;
  }
}
