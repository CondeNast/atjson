import { Annotation } from "@atjson/document";
import WebComponent from "../mixins/component";

export default class OffsetHeadingActionButton extends WebComponent {
  static template =
    '<button class="toggle">H</button><button class="level"></button>';

  static style = `
    :host(.active) .toggle {
      border-color: red;
      font-weight: bold;
    }

    .level {
      display: none;
    }

    :host(.active) .level {
      display: initial;
    }

    :host(.active) .level.hidden {
      display: none;
    }
  `;

  static events = {
    selectionchange: "onSelectionChange",
    "click .toggle": "onToggleClick",
    "click .level": "onLevelClick"
  };

  selection: any;

  getOverlappingHeading() {
    return this.selection.selectedAnnotations.find(
      (a: Annotation) => a.type === "heading"
    );
  }

  onSelectionChange(evt: CustomEvent) {
    let { start, end, document } = evt.detail;
    let newlineFree: boolean = false;

    if (start !== end) {
      let coveredContent = document.content.slice(start, end);
      let nlIdx = coveredContent.lastIndexOf("\n");
      newlineFree = nlIdx === -1 || nlIdx === end - 1;
    }

    if (!this.shadowRoot) return;

    // Only display if the selection *does not* span multiple paragraphs.
    if (newlineFree) {
      this.selection = evt.detail;

      let overlappingHeading = this.getOverlappingHeading();
      let levelButton = this.shadowRoot.querySelector(".level");
      let toggleButton = this.shadowRoot.querySelector(".toggle");

      if (!levelButton || !toggleButton) return;

      if (overlappingHeading) {
        toggleButton.textContent = "H" + overlappingHeading.attributes.level;
        this.classList.add("active");
        let nextLevel = parseInt(overlappingHeading.attributes.level, 10) + 1;
        if (nextLevel < 4) {
          levelButton.textContent = "H" + nextLevel;
          levelButton.classList.remove("hidden");
        } else {
          levelButton.classList.add("hidden");
        }
      } else {
        toggleButton.textContent = "H1";
        levelButton.classList.add("hidden");
        this.classList.remove("active");
      }

      this.style.display = "initial";
    } else {
      delete this.selection;
      evt.preventDefault();
      this.style.display = "none";
    }
  }

  onToggleClick() {
    let overlappingHeading = this.getOverlappingHeading();

    if (overlappingHeading) {
      // Delete (toggle) the Heading
      this.dispatchEvent(
        new CustomEvent("deleteAnnotation", {
          bubbles: true,
          composed: true,
          detail: {
            annotationId: overlappingHeading.id
          }
        })
      );
      this.dispatchEvent(
        new CustomEvent("addAnnotation", {
          bubbles: true,
          composed: true,
          detail: {
            type: "paragraph",
            start: overlappingHeading.start,
            end: overlappingHeading.end
          }
        })
      );
    } else {
      // Create a new Heading at level 1
      let content = this.selection.document.content;
      let start = Math.max(
        0,
        content.lastIndexOf("\n", parseInt(this.selection.start, 10))
      );
      let end = content.indexOf("\n", parseInt(this.selection.end, 10));
      if (end === -1) end = content.length;

      this.dispatchEvent(
        new CustomEvent("addAnnotation", {
          bubbles: true,
          composed: true,
          detail: {
            type: "heading",
            start,
            end,
            attributes: { level: 1 }
          }
        })
      );
    }
  }

  onLevelClick() {
    let overlappingHeading = this.getOverlappingHeading();

    let level = parseInt(overlappingHeading.attributes.level, 10) + 1;

    // Update the existing heading's level.
    this.dispatchEvent(
      new CustomEvent("attributechange", {
        bubbles: true,
        composed: true,
        detail: {
          annotationId: overlappingHeading.id,
          attributes: Object.assign(overlappingHeading.attributes, { level })
        }
      })
    );
  }
}

if (!window.customElements.get("offset-heading-action-button")) {
  window.customElements.define(
    "offset-heading-action-button",
    OffsetHeadingActionButton
  );
}
