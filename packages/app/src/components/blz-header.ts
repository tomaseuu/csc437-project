import { html } from "@unbndl/html";
import { fromAuth } from "@unbndl/auth";
import { createViewModel } from "@unbndl/view";
import { fromHistory } from "@unbndl/switch";
import { fromStore } from "@unbndl/store";
import { Challenge } from "server/models";
import { Model } from "../model";

interface HeaderState {
  authenticated: boolean;
  username: string;
  location?: Location;
  challenges?: Challenge[];
  selectedChallenge?: Challenge;
  darkMode: boolean;
}

export class BlzHeaderElement extends HTMLElement {
  viewModel = createViewModel<HeaderState>({
    authenticated: false,
    username: "traveler",
    darkMode: false,
  })
    .with(fromAuth(this), "authenticated", "username")
    .with(fromHistory(this), "location")
    .with(fromStore<Model>(this), "challenges", "selectedChallenge");

  view = html<[HeaderState]>`
    <header class="site-header">
      <a class="brand-lockup" href="/app" aria-label="Go to Consistently home">
        <img
          class="brand-logo"
          src="/icons/logo-mark.png"
          alt="Consistently logo" />
        <span class="brand-copy">
          <span class="brand-title">Consistently</span>
          <span class="brand-tagline">Habit challenges made simple</span>
        </span>
      </a>

      <div class="user-profile" aria-label="Current user">
        <span class="user-avatar" aria-hidden="true">
          ${(state: HeaderState) =>
            (state.username || "traveler").slice(0, 1).toUpperCase()}
        </span>
        <p class="user-greeting">
          Hello, ${(state: HeaderState) => state.username || "traveler"}
        </p>
        <div class="user-actions">
          <a
            href="/app/challenges"
            class="header-shortcut"
            aria-current=${(state: HeaderState) =>
              state.location?.pathname?.startsWith("/app/challenges")
                ? "page"
                : "false"}>
            Your Challenges
          </a>
          <button
            type="button"
            class="theme-toggle"
            aria-pressed=${(state: HeaderState) =>
              state.darkMode ? "true" : "false"}>
            ${(state: HeaderState) =>
              state.darkMode ? "Light Mode" : "Dark Mode"}
          </button>
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
    </header>
  `;

  constructor() {
    super();

    this.viewModel.createEffect(() => this.render());
  }

  connectedCallback() {
    this.syncThemeState();
    this.render();
  }

  render() {
    this.replaceChildren(this.viewModel.render(this.view));

    this.querySelector<HTMLButtonElement>(".theme-toggle")?.addEventListener(
      "click",
      () => this.toggleTheme()
    );

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
  toggleTheme() {
    const nextDarkMode = !document.body.classList.contains("dark-mode");
    document.body.classList.toggle("dark-mode", nextDarkMode);
    window.localStorage.setItem("consistently:dark-mode", String(nextDarkMode));
    this.viewModel.set("darkMode", nextDarkMode);
  }

  syncThemeState() {
    const storedTheme = window.localStorage.getItem("consistently:dark-mode");
    const darkMode = storedTheme === "true";

    document.body.classList.toggle("dark-mode", darkMode);
    this.viewModel.set("darkMode", darkMode);
  }
}
