import { html, css, shadow } from "@unbndl/html";
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
  constructor() {
    super();
    shadow(this).styles(
      reset.styles,
      ChallengeOverviewLoaderElement.styles
    );
  }

  static observedAttributes = ["src"];

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "src" && newValue && newValue !== oldValue) {
      this.hydrate(newValue).then((data) => {
        if (!data) return;

        const view = ChallengeOverviewLoaderElement.render(data);
        shadow(this).replace(view);
        shadow(this).styles(
          reset.styles,
          ChallengeOverviewLoaderElement.styles
        );
      });
    }
  }

  hydrate(src) {
    return fetch(src)
      .then((response) => {
        if (response.status !== 200) throw `HTTP Status ${response.status}`;
        return response.json();
      })
      .catch((error) => {
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
