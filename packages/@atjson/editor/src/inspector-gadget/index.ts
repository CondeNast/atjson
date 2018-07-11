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
    <h1>AtJSON Document Inspector</h1>
    <h2>Content</h2>
    <div class="cc-container">
      <character-counter start="0" end="0" length="0"></character-counter>
    </div>
    
    <h2>Annotations</h2>
    <annotations-inspector class="annotations"></annotations-inspector>`;

  static style = `
    :host {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 50vh;
      margin: 1em;
      overflow: hidden;
      border: 1px solid #555555;
      padding: 0;
    }

    h1 {
      font-size: 1em;
      font-family: helvetica;
      width: calc(100vw-2em);
      background-color: #bbbbbb;
      padding: 4px;
      margin: 0;
    }

    h2 {
      margin: 0;
      font-size: 0.75em;
      font-family: helvetica;
      width: calc(100vw-2em);
      background-color: #dddddd;
      padding: 4px;
    }

    .cc-container {
      max-width: 100vw;
      overflow-x: auto;
      margin: 0 6px 5px 6px;
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
