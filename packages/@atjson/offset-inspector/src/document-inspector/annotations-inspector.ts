import Document from "@atjson/document";
import WebComponent from "../../src/mixins/component";
import "./annotation-attribute";
import "./annotation-inspector";

export default class AnnotationsInspector extends WebComponent {
  static template = ``;

  static style = `
    .container {
      overflow-y: scroll;
      position: relative;
      max-height: 100%;
    }
  `;

  document: Document;

  updateBody() {
    let aInspectors = {};
    this.document.annotations.forEach(a => {
      let id = a.id.toString();
      let b = this.shadowRoot.querySelector(`[id="${id}"]`);
      aInspectors[id] = b;
    });

    this.shadowRoot.childNodes.forEach(c => {
      if (!aInspectors[c.getAttribute("id")]) this.shadowRoot.removeChild(c);
    });

    this.document.annotations
      .sort((a, b) => a.start - b.start)
      .forEach(a => {
        let aInspector;
        if (aInspectors[a.id.toString()]) {
          aInspector = aInspectors[a.id.toString()];
        } else {
          aInspector = document.createElement("annotation-inspector");
          aInspector.setAttribute("id", a.id);
          this.shadowRoot.appendChild(aInspector);
        }
        aInspector.setAttribute("type", a.type);
        aInspector.setAttribute("start", a.start);
        aInspector.setAttribute("end", a.end);

        if (a.attributes) {
          Object.keys(a.attributes).forEach(key => {
            let aAttribute = aInspector.querySelector(`[name="${key}"]`);
            if (aAttribute === null) {
              aAttribute = document.createElement("annotation-attribute");
              aAttribute.setAttribute("name", key);
              aInspector.appendChild(aAttribute);
            }
            aAttribute.setAttribute("value", a.attributes[key]);
          });
        }
      });
  }

  setDocument(doc) {
    // n.b. this really needs a document.removeEventListener, and probably should be refactored in general.
    if (this.document === doc) return;
    this.document = doc;
    this.document.addEventListener("change", () => {
      if (this._updateCallback) return;
      this._updateCallback = () => {
        this.updateBody();
        setTimeout(() => {
          delete this._updateCallback;
        }, 0);
      };
      window.requestIdleCallback(this._updateCallback);
    });
  }
}

if (!window.customElements.get("annotations-inspector")) {
  window.customElements.define("annotations-inspector", AnnotationsInspector);
}
