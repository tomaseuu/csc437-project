import { html, css, shadow } from "@unbndl/html";
import reset from "./styles/reset.css.js";

export class ChallengeOverviewElement extends HTMLElement {
  static template = html`
    <template>
      <article class="content-grid grid-span-12">
        <section class="content-card grid-span-4">
          <h2>Challenge Details</h2>
          <p><strong>Duration:</strong> <slot name="duration"></slot></p>
          <p><strong>Status:</strong> <slot name="status"></slot></p>
          <p>
            <strong><slot name="stake"></slot></strong>
          </p>
        </section>

        <section class="content-card grid-span-4">
          <h2>Participants</h2>
          <ul class="sequence-list">
            <li class="sequence-item"><slot name="participant-one"></slot></li>
            <li class="sequence-item"><slot name="participant-two"></slot></li>
          </ul>
        </section>

        <section class="content-card grid-span-4">
          <h2>How Scoring Works</h2>
          <p><slot name="scoring"></slot></p>
        </section>
      </article>
    </template>
  `;

  constructor() {
    super();
    shadow(this)
      .template(ChallengeOverviewElement.template)
      .styles(reset.styles, ChallengeOverviewElement.styles);
  }

  static styles = css`
    :host {
      display: block;
      grid-column: span 12;
      min-width: 0;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: var(--space-lg);
    }

    .content-grid > * {
      min-width: 0;
    }

    .content-card {
      display: grid;
      gap: var(--space-sm);
      padding: var(--space-md);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background-color: var(--color-background-surface);
    }

    .content-card h2 {
      padding-bottom: var(--space-xs);
      border-bottom: 1px solid var(--color-border);
    }

    .content-card p,
    .content-card li {
      max-width: 60ch;
    }

    .grid-span-12 {
      grid-column: span 12;
    }

    .grid-span-4 {
      grid-column: span 4;
    }

    .sequence-list {
      display: grid;
      gap: var(--space-sm);
      padding-left: 0;
      list-style: none;
    }

    .sequence-item {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      min-height: 3rem;
      padding: var(--space-sm);
      border: 1px solid var(--color-border);
      border-radius: 8px;
    }

    .sequence-item + .sequence-item {
      margin-top: 0;
    }

    .sequence-item a {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
    }

    @media (max-width: 900px) {
      .content-grid {
        grid-template-columns: repeat(8, minmax(0, 1fr));
      }

      .grid-span-12 {
        grid-column: span 8;
      }

      .grid-span-4 {
        grid-column: span 4;
      }
    }

    @media (max-width: 600px) {
      .content-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: var(--space-md);
      }

      .grid-span-12,
      .grid-span-4 {
        grid-column: span 4;
      }

      .sequence-item {
        align-items: flex-start;
      }
    }
  `;
}
