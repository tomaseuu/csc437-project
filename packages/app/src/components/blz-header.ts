import { html } from "@unbndl/html";
import { fromAuth } from "@unbndl/auth";
import { createViewModel } from "@unbndl/view";
import { fromHistory } from "@unbndl/switch";

interface HeaderState {
  authenticated: boolean;
  username: string;
  location?: Location;
}

export class BlzHeaderElement extends HTMLElement {
  viewModel = createViewModel<HeaderState>({
    authenticated: false,
    username: "traveler"
  })
    .with(fromAuth(this), "authenticated", "username")
    .with(fromHistory(this), "location");

  view = html<[HeaderState]>`
    <header class="site-header">
      <div class="header-title">
        <a class="app-name" href="/app">Habit Challenges</a>
        <div class="header-copy">
          <p class="header-kicker">
            ${(state: HeaderState) =>
              state.location?.pathname?.startsWith("/app/challenges/")
                ? "Challenge"
                : "Dashboard"}
          </p>
          <h1>
            ${(state: HeaderState) =>
              state.location?.pathname?.startsWith("/app/challenges/")
                ? "Challenge Details"
                : "Active Challenges"}
          </h1>
          <p>
            A simple collection of friend-based habit challenges where each
            person tracks their own goal and competes on consistency.
          </p>
        </div>
      </div>

      <nav class="site-nav" aria-label="Primary navigation">
        <a
          href="/app"
          aria-current=${(state: HeaderState) =>
            state.location?.pathname === "/app" ? "page" : "false"}>
          Challenges
        </a>
        <a
          href=${(state: HeaderState) =>
            state.location?.pathname?.startsWith("/app/challenges/")
              ? state.location.pathname
              : "/app"}
          aria-current=${(state: HeaderState) =>
            state.location?.pathname?.startsWith("/app/challenges/")
              ? "page"
              : "false"}>
          ${(state: HeaderState) =>
            state.location?.pathname?.startsWith("/app/challenges/")
              ? "Details"
              : "Overview"}
        </a>
      </nav>

      <div class="user-profile" aria-label="Current user">
        <span class="user-avatar" aria-hidden="true">
          ${(state: HeaderState) =>
            (state.username || "traveler").slice(0, 1).toUpperCase()}
        </span>
        <div class="user-copy">
          <p>Hello, ${(state: HeaderState) => state.username || "traveler"}</p>
          <div class="user-actions">
            <button
              type="button"
              class=${(state: HeaderState) =>
                state.authenticated ? "signout-button" : "signout-button hidden"}>
              Sign Out
            </button>
            <a
              href="/login.html"
              class=${(state: HeaderState) =>
                state.authenticated ? "signin-link hidden" : "signin-link"}>
              Sign In
            </a>
          </div>
        </div>
      </div>
    </header>
  `;

  constructor() {
    super();

    this.viewModel.createEffect(() => this.render());
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.replaceChildren(this.viewModel.render(this.view));

    this.querySelector<HTMLButtonElement>(".signout-button")?.addEventListener(
      "click",
      () => this.signout()
    );
  }

  signout() {
    this.dispatchEvent(
      new CustomEvent("auth:message", {
        bubbles: true,
        composed: true,
        detail: ["auth/signout"]
      })
    );
  }
}
