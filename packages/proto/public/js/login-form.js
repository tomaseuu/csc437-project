import { css, html, shadow } from "@unbndl/html";
import { createViewModel, fromInputs } from "@unbndl/view";
import reset from "./styles/reset.css.js";

export class LoginFormElement extends HTMLElement {
  static styles = css`
    :host {
      display: block;
    }

    form {
      display: grid;
      gap: var(--space-md, 1rem);
    }

    button {
      border: 0;
      border-radius: 999px;
      padding: 0.75rem 1rem;
      background: var(--color-primary, #53b593);
      color: var(--color-text, #07100c);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }
    button:hover {
      filter: brightness(0.97);
    }
  `;

  viewModel = createViewModel({
    username: "",
    password: ""
  }).with(fromInputs(this), "username", "password");

  view = html`
    <form>
      <slot></slot>
      <button type="submit">
        <slot name="submit-label">Login</slot>
      </button>
    </form>
  `;

  constructor() {
    super();

    shadow(this)
      .styles(reset.styles, LoginFormElement.styles)
      .replace(this.viewModel.render(this.view))
      .listen({
        submit: (event) =>
          this.submitLogin(event, this.getAttribute("api") || "#")
      });
  }

  submitLogin(event, endpoint) {
    event.preventDefault();

    const data = this.viewModel.toObject();
    const method = "POST";
    const headers = {
      "Content-Type": "application/json"
    };
    const body = JSON.stringify(data);

    fetch(endpoint, { method, headers, body })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`Form submission failed: Status ${response.status}`);
        }

        return response.json();
      })
      .then((json) => {
        const { token } = json;
        const message = new CustomEvent("auth:message", {
          bubbles: true,
          composed: true,
          detail: ["auth/signin", { token, redirect: "/" }]
        });

        this.dispatchEvent(message);
      })
      .catch((error) => {
        console.error("Login failed:", error);
      });
  }
}
