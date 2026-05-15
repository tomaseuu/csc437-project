import { html, css, shadow } from "@unbndl/html";
import { fromAuth } from "@unbndl/auth";
import { createViewModel, fromAttributes } from "@unbndl/view";
import reset from "./styles/reset.css.js";

function renderParticipantOne(participantOne = {}) {
  const { name = "", goal = "", href = "" } = participantOne;

  return href
    ? html`
        ${name}: 
        <a href=${href}>${goal}</a>
      `
    : `${name}: ${goal}`;
}

function renderParticipantTwo(participantTwo = {}) {
  const { name = "", goal = "" } = participantTwo;

  return `${name}: ${goal}`;
}

export class ChallengeOverviewLoaderElement extends HTMLElement {
  viewModel = createViewModel({
    authenticated: false,
    src: "",
    token: undefined
  })
    .with(fromAttributes(this), "src")
    .with(fromAuth(this), "authenticated", "token");

  lastLoadedSrc = "";

  constructor() {
    super();
    shadow(this).styles(
      reset.styles,
      ChallengeOverviewLoaderElement.styles
    );

    this.viewModel.createEffect(($) => {
      if (!$.src) return;
      this.loadSrc($.src);
    });
  }

  static get observedAttributes() {
    return ["src"];
  }

  connectedCallback() {
    const src = this.getAttribute("src");

    if (src) {
      this.viewModel.set("src", src);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "src" && newValue && newValue !== oldValue) {
      this.viewModel.set("src", newValue);
      this.loadSrc(newValue);
    }
  }

  get authorization() {
    const $ = this.viewModel.toObject();

    if ($.authenticated) {
      return { Authorization: `Bearer ${$.token}` };
    }

    return {};
  }

  isProtectedApi(src) {
    return src.startsWith("/api/");
  }

  loadSrc(src) {
    const $ = this.viewModel.toObject();

    if (!src) return;
    if (src === this.lastLoadedSrc) return;
    if (this.isProtectedApi(src) && (!$.authenticated || !$.token)) return;

    this.lastLoadedSrc = src;

    this.hydrate(src).then((data) => {
      if (!data) return;

      const view = ChallengeOverviewLoaderElement.render(data);
      shadow(this).replace(view);
      shadow(this).styles(
        reset.styles,
        ChallengeOverviewLoaderElement.styles
      );
    });
  }

  hydrate(src) {
    const options = this.isProtectedApi(src)
      ? { headers: this.authorization }
      : {};

    return fetch(src, options)
      .then((response) => {
        if (response.status !== 200) throw `HTTP Status ${response.status}`;
        return response.json();
      })
      .catch((error) => {
        this.lastLoadedSrc = "";
        console.log(`Could not fetch ${src}:`, error);
      });
  }

  static render(data = {}) {
    const {
      duration = "",
      status = "",
      stake = "",
      participantOne = {},
      participantTwo = {},
      scoring = ""
    } = data;

    return html`
      <challenge-overview>
        <span slot="duration">${duration}</span>
        <span slot="status">${status}</span>
        <span slot="stake">${stake}</span>
        <span slot="participant-one">
          ${renderParticipantOne(participantOne)}
        </span>
        <span slot="participant-two">
          ${renderParticipantTwo(participantTwo)}
        </span>
        <span slot="scoring">${scoring}</span>
      </challenge-overview>
    `;
  }

  static styles = css`
    :host {
      display: block;
      grid-column: span 12;
      min-width: 0;
    }
  `;
}

customElements.define(
  "challenge-overview-loader",
  ChallengeOverviewLoaderElement
);
