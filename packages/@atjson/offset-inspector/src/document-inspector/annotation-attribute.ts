import WebComponent from "../../src/mixins/component";

export default class AnnotationAttribute extends WebComponent {
  static template =
    '<div class="attribute"><span class="name"></span>: "<span class="value"></span>"</div>';

  static style = `
    .attribute {
      padding: 0;
      margin: 0;
    }

    .name {
      padding-left: 1em;
      color: rgb(153, 69, 0);
    }

    .value {
      color: rgb(26, 26, 166);
    }
  `;

  static observedAttributes = ["name", "value"];

  attributeChangedCallback(attribute) {
    switch (attribute) {
      case "name":
        this.shadowRoot.querySelector(".name").innerHTML = this.getAttribute(
          "name"
        );
        break;
      case "value":
        this.shadowRoot.querySelector(".value").innerHTML = this.getAttribute(
          "value"
        );
        break;
    }
  }
}

if (!window.customElements.get("annotation-attribute")) {
  window.customElements.define("annotation-attribute", AnnotationAttribute);
}
