import { css, html, shadow } from "@unbndl/html";
import { createViewModel } from "@unbndl/view";
import { fromAuth } from "@unbndl/auth";
import reset from "./styles/reset.css.js";

export class HeaderElement extends HTMLElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--space-xs, 0.5rem);
      flex: 0 0 auto;
      font-weight: 700;
    }

    .user-avatar {
      display: grid;
      place-items: center;
      width: 2.5rem;
      height: 2.5rem;
      border: 2px solid var(--color-text, #07100c);
      border-radius: 50%;
      background-color: var(--color-background-surface, #ffffff);
      color: var(--color-primary, #53b593);
    }

    .user-copy {
      display: grid;
      gap: var(--space-2xs, 0.25rem);
    }

    .user-copy p {
      margin: 0;
    }

    .user-actions {
      display: flex;
      gap: var(--space-xs, 0.5rem);
      align-items: center;
    }

    .when-signed-in,
    .when-signed-out {
      display: none;
    }

    .logged-in .when-signed-in,
    .logged-out .when-signed-out {
      display: inline-flex;
    }

    a,
    button {
      border: 1px solid currentColor;
      border-radius: 8px;
      padding: var(--space-2xs, 0.25rem) var(--space-xs, 0.5rem);
      background: transparent;
      color: inherit;
      font: inherit;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
    }
  `;

  viewModel = createViewModel({
    authenticated: false,
    username: ""
  }).with(fromAuth(this), "authenticated", "username");

  view = html`
    <span class="user-avatar" aria-hidden="true">
      ${($) => ($.username || "traveler").slice(0, 1).toUpperCase()}
    </span>
    <div
      class=${($) => ($.authenticated ? "user-copy logged-in" : "user-copy logged-out")}>
      <p>Hello, ${($) => $.username || "traveler"}</p>
      <div class="user-actions">
        <button class="when-signed-in" type="button">Sign Out</button>
        <a class="when-signed-out" href="/login.html">Sign In</a>
      </div>
    </div>
  `;

  constructor() {
    super();

    shadow(this)
      .styles(reset.styles, HeaderElement.styles)
      .replace(this.viewModel.render(this.view))
      .delegate(".when-signed-in", {
        click: () => this.signout()
      });
  }

  signout() {
    const customEvent = new CustomEvent("auth:message", {
      bubbles: true,
      composed: true,
      detail: ["auth/signout"]
    });

    this.dispatchEvent(customEvent);
  }
}
