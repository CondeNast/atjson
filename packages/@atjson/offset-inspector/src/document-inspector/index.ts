import Document from '@atjson/document';
import WebComponent from '../mixins/component';
import './annotations-inspector';
import './character-counter';

export default class InspectorGadget extends WebComponent {

  static template = `
    <div class="heading"><div>AtJSON</div></div>
    <section class="content">
      <div class="heading"><div>Content</div></div>
      <div class='position'>
        <span class='start'></span>
        <span class='end'></span>
      </div>
      <div class="cc-container">
        <character-counter start="0" end="0" length="0"></character-counter>
      </div>
    </section>

    <section class="annotations">
      <div class="heading"><div>Annotations</div></div>
      <annotations-inspector class="annotations"></annotations-inspector>
    </section>`;

  static style = `
    .heading {
      font-size: 12px;
      line-height: 15px;
      height: 26px;
      font-family: helvetica;
      background-color: #f3f3f3;
      color: #333;
      padding: 0;
      margin: 0;
      font-weight: normal;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      border-bottom: 1px solid #ccc;
      display: flex;
      flex-direction: row;
    }

    .heading > div {
      padding: 4px 1em;
      border-bottom: 2px solid #03a9f4;
    }

    .content {
      margin-top: 1em;
    }

    section > .heading {
      border-top: 1px solid #ccc;
      background-color: #f6f6f6;
    }

    section > .heading > div {
      border-bottom: none;
    }

    .content {
      font-family: Consolas, Lucida Console, Courier New, monospace;
      position: relative;
      box-sizing: border;
    }

    .content .open, .content .close {
      color: #333;
      font-weight: bold
    }

    .cc-container {
      max-width: 100%;
      overflow-x: auto;
      margin: 0 6px 5px 6px;
    }

    .position {
      position: absolute;
      top: 1ex;
      right: 1ex;
    }

    .position.is-caret .end {
      display: none;
    }
  `;

  document: Document;

  updatePosition({start, end}) {
    this.shadowRoot.querySelector('.start').textContent = start;
    this.shadowRoot.querySelector('.end').textContent = end;

    if (start === end) {
      this.shadowRoot.querySelector('.position').classList.add('is-caret');
    } else {
      this.shadowRoot.querySelector('.position').classList.remove('is-caret');
    }
  }

  setDocument(doc) {
    this.document = doc;
    this.shadowRoot.querySelector('annotations-inspector').setDocument(doc);
    this.document.addEventListener('change', (_ => {
      if (this.deferred) clearTimeout(this.deferred);
      this.deferred = setTimeout(_ => {
        let charCounter = this.shadowRoot.querySelector('character-counter');
        charCounter.setAttribute('content', this.document.content);
      }, 500);
    }));
  }

  setSelection(el) {
    el.addEventListener('change', evt => {
      if (this.selDeferred) clearTimeout(this.selDeferred);
      this.selDeferred = setTimeout(_ => {
        let charCounter = this.shadowRoot.querySelector('character-counter');
        charCounter.setAttribute('start', evt.detail.start);
        charCounter.setAttribute('end', evt.detail.end);
        this.updatePosition(evt.detail);
      }, 500);
    });
  }
}

if (!window.customElements.get('inspector-gadget')) {
  window.customElements.define('inspector-gadget', InspectorGadget);
}
