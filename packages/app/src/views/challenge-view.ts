import { fromAuth } from "@unbndl/auth";
import { createViewModel } from "@unbndl/view";
import {
  Challenge,
  escapeHtml,
  getChallengeDetails,
  getChallengeImageSrc
} from "../challenge-meta";

interface ChallengeState {
  authenticated: boolean;
  token?: string;
  challengeId: string;
  loading: boolean;
  error?: string;
  challenge?: Challenge;
}

export class ChallengeViewElement extends HTMLElement {
  static observedAttributes = ["challenge-id"];

  viewModel = createViewModel<ChallengeState>({
    authenticated: false,
    token: undefined,
    challengeId: "",
    loading: false,
    error: undefined,
    challenge: undefined
  }).with(fromAuth(this), "authenticated", "token");

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
    this.viewModel.set(
      "challengeId",
      this.getAttribute("challenge-id") || ""
    );
    this.render(this.viewModel.toObject());
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ) {
    if (name === "challenge-id") {
      this.loadedKey = undefined;
      this.viewModel.update({
        challengeId: newValue || "",
        challenge: undefined,
        error: undefined
      });
    }
  }

  async loadChallenge(id: string, token: string) {
    this.loadedKey = `${token}:${id}`;
    this.viewModel.update({
      loading: true,
      error: undefined
    });

    try {
      const response = await fetch(`/api/challenges/${encodeURIComponent(id)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const challenge = (await response.json()) as Challenge;

      this.viewModel.update({
        loading: false,
        challenge
      });
    } catch (error) {
      this.loadedKey = undefined;
      this.viewModel.update({
        loading: false,
        error: `Could not load challenge: ${String(error)}`
      });
    }
  }

  render(state: ChallengeState) {
    if (state.loading) {
      this.innerHTML = `
        <main class="page-grid">
          <section class="content-card grid-span-12">
            <p>Loading challenge...</p>
          </section>
        </main>
      `;
      return;
    }

    if (state.error) {
      this.innerHTML = `
        <main class="page-grid">
          <section class="content-card grid-span-12">
            <h2>Challenge Details</h2>
            <p>${escapeHtml(state.error)}</p>
            <p><a href="/app">Back to challenges</a></p>
          </section>
        </main>
      `;
      return;
    }

    if (!state.challenge) {
      this.innerHTML = `
        <main class="page-grid">
          <section class="content-card grid-span-12">
            <p>Select a challenge from the dashboard.</p>
          </section>
        </main>
      `;
      return;
    }

    const challenge = state.challenge;
    const details = getChallengeDetails(challenge);
    const imageSrc = getChallengeImageSrc(challenge.image);

    this.innerHTML = `
      <main class="page-grid">
        <section class="content-card grid-span-12">
          <p class="header-kicker">Challenge</p>
          <h2>${escapeHtml(challenge.title)}</h2>
          <p>${escapeHtml(challenge.description)}</p>
          <p><a href="/app">Back to all challenges</a></p>
        </section>

        <section class="content-card grid-span-4">
          <h2>Challenge Details</h2>
          <p><strong>Duration:</strong> ${escapeHtml(details.duration)}</p>
          <p><strong>Status:</strong> ${escapeHtml(details.status)}</p>
          <p><strong>${escapeHtml(details.stake)}</strong></p>
        </section>

        <section class="content-card grid-span-4">
          <h2>Participants</h2>
          <ul class="sequence-list">
            <li class="sequence-item">
              ${escapeHtml(details.participantOne.name)}:
              ${escapeHtml(details.participantOne.goal)}
            </li>
            <li class="sequence-item">
              ${escapeHtml(details.participantTwo.name)}:
              ${escapeHtml(details.participantTwo.goal)}
            </li>
          </ul>
        </section>

        <section class="content-card grid-span-4">
          <h2>How Scoring Works</h2>
          <p>${escapeHtml(details.scoring)}</p>
        </section>

        ${
          imageSrc
            ? `
              <section class="content-card grid-span-12">
                <h2>Challenge Image</h2>
                <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(challenge.title)}" />
              </section>
            `
            : ""
        }
      </main>
    `;
  }
}
