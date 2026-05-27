import { createViewModel } from "@unbndl/view";
import { Store, fromStore } from "@unbndl/store";
import { Challenge } from "server/models";
import { Model } from "../model";
import { Msg } from "../messages";
import { escapeHtml, getChallengeIconHref } from "../challenge-meta";

interface HomeState {
  challenges?: Challenge[];
}

export class HomeViewElement extends HTMLElement {
  viewModel = createViewModel<HomeState>({}).with(
    fromStore<Model>(this),
    "challenges",
  );

  constructor() {
    super();

    this.viewModel.createEffect(($) => {
      this.render($);
    });
  }

  connectedCallback() {
    this.render(this.viewModel.toObject());

    if (this.viewModel.$.challenges === undefined) {
      Store.dispatch(this, ["challenges/request", {}] as Msg);
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
    if (state.challenges === undefined) {
      return "<p>Loading challenges...</p>";
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
