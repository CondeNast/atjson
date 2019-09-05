import WebComponent from "../mixins/component";

export default class LinkEditor extends WebComponent {
  static template = `<a target="_blank">🔗</a>&nbsp;<div class="default"><input type="text" class="urlinput" /></div><div class="extended"><input type="checkbox" name="nofollow" class="nofollow" /><label for="nofollow">No&nbsp;Follow</label></div>&nbsp; <button class="config">⚙️</button><button class="cancel">❌</button><button class="save">✔️</button>&nbsp;`;

  static events = {
    beforeinput: "beforeInput",
    "click .cancel": "cursorBlur",
    "click .save": "onSave",
    "click .config": "onConfig",
    "keypress .urlinput": "handleKeypress"
  };

  static observedAttributes = ["url", "nofollow"];

  static style = `
    :host {
      display: flex;
    }

    .extended {
      display: none;
      width: max-content;
    }

    :host(.config) .default {
      display: none;
    }

    :host(.config) .extended {
      display: block;
    }

    :host(.config) button.config {
      background: darkgrey;
    }
  `;

  onConfig() {
    this.classList.toggle("config");
  }

  beforeInput(evt: Event) {
    evt.stopPropagation();
  }

  handleKeypress(evt: KeyboardEvent) {
    if (evt.keyCode === 13) {
      this.onSave(evt);
    }
  }

  onSave(evt: Event) {
    this.setAttribute("url", this.urlInput.value);

    if (this.nofollowInput.checked) {
      this.setAttribute("nofollow", "");
    } else {
      this.removeAttribute("nofollow");
    }

    this.dispatchEvent(
      new CustomEvent("attributechange", {
        bubbles: true,
        composed: true,
        detail: {
          attributes: {
            url: this.urlInput.value,
            nofollow: this.nofollowInput.checked
          }
        }
      })
    );

    this.dispatchEvent(
      new CustomEvent("resumeinput", { bubbles: true, composed: true })
    );

    evt.stopPropagation();
  }

  attributeChangedCallback(attribute: string) {
    switch (attribute) {
      case "url":
        this.urlInput.setAttribute("value", this.getAttribute("url") || "");
        break;
      case "nofollow":
        this.nofollowInput.checked = this.hasAttribute("nofollow");
        break;
    }
  }

  private get urlInput(): HTMLInputElement {
    if (!this.shadowRoot) throw new Error("No shadowRoot found!");
    let input: HTMLInputElement | null = this.shadowRoot.querySelector(
      ".urlinput"
    );
    if (!input) throw new Error("No URL Input Element Found!");
    return input;
  }

  private get nofollowInput(): HTMLInputElement {
    if (!this.shadowRoot) throw new Error("No shadowRoot found!");
    let input: HTMLInputElement | null = this.shadowRoot.querySelector(
      ".nofollow"
    );
    if (!input) throw new Error("No nofollow Input Element Found!");
    return input;
  }
}

if (!window.customElements.get("link-editor")) {
  window.customElements.define("link-editor", LinkEditor);
}
