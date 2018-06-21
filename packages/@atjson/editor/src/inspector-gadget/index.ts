import AnnotationsInspector from './annotations-inspector';
import CharacterCounter from './character-counter';
import Document from '@atjson/document';
import WebComponent from '../mixins/component';

if (!window.customElements.get('annotations-inspector')) {
  window.customElements.define('annotations-inspector', AnnotationsInspector);
}

if (!window.customElements.get('character-counter')) {
  window.customElements.define('character-counter', CharacterCounter);
}

export default class InspectorGadget extends WebComponent {

  static template = `
    <h1>Character Counter</h1>
    <div class="cc-container">
      <character-counter start="0" end="0" length="0"></character-counter>
    </div>
    
    <h1>Annotations</h1>
    <annotations-inspector class="annotations"></annotations-inspector>`;

  static style = `
    :host {
      position: fixed;
      bottom: 0;
      left: 0;
      max-height: 50vh;
      overflow: scroll-y;
    }

    h1 {
      font-size: 1em;
      font-family: helvetica;
      width: 100vw;
      background-color: #cccccc;
      padding: 4px;
    }

    .cc-container {
      max-width: 100vw;
      overflow-x: auto;
    }
  `;

  document: Document;

  setDocument(doc) {
    this.document = doc;
    this.shadowRoot.querySelector('annotations-inspector').setDocument(doc);
    this.document.addEventListener('change', (_ => {
      let charCounter = this.shadowRoot.querySelector('character-counter');
      charCounter.setAttribute('length', this.document.content.length);
      charCounter.innerHTML = "<span>" + this.document.content.replace(/\n/g, "¶") + "</span>";
    }));
  }

  setSelection(el) {
    el.addEventListener('change', evt => {
      let charCounter = this.shadowRoot.querySelector('character-counter');
      charCounter.setAttribute('start', evt.detail.start);
      charCounter.setAttribute('end', evt.detail.end);
    });
  }
}
