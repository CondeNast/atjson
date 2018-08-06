import Document from '@atjson/document';
import WebComponent from '../../src/mixins/component';
import './annotation-attribute';
import './annotation-inspector';

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
    let body = '';
    this.document.annotations.sort((a, b) => a.start - b.start).forEach(a => {
      body += `<annotation-inspector type="${a.type}" start="${a.start}" end=${a.end}>`;
      if (a.attributes) {
        Object.keys(a.attributes).forEach(key => {
          body += `<annotation-attribute name='${key}' value='${a.attributes[key]}'></annotation-attribute>`;
        });
      }
      body += '</annotation-inspector>';
    });
    this.shadowRoot.innerHTML = body;
  }

  setDocument(doc) {
    this.document = doc;
    this.document.addEventListener('change', () => window.requestAnimationFrame(() => this.updateBody()));
  }
}

if (!window.customElements.get('annotations-inspector')) {
  window.customElements.define('annotations-inspector', AnnotationsInspector);
}
