import WebComponent from '../../src/mixins/component';
import './annotation-attribute';

export default class AnnotationInspector extends WebComponent {

  static template = `
    <div class="annotation">
      <span class="type"></span>
      {<span class="attributes"><slot></slot></span>}
      <div class="position">
        [<div class="start"></div>,&nbsp;<div class="end"></div>]
      </div>
    </div>
  `;

  static style = `
    :host {
      font-family: Consolas, Lucida Console, Courier New, monospace;
      width: 100%;
    }

    .annotation {
      padding: 1ex;
      border-bottom: 1px solid #ccc;
      position: relative;
    }

    .type {
      color: rgb(136, 18, 128);
    }

    .position {
      position: absolute;
      top: 1ex;
      right: 1ex;
      display: flex;
      flex-direction: row;
    }
  `;

  static observedAttributes = ['type', 'start', 'end'];

  attributeChangedCallback(attribute) {
    switch (attribute) {
      case 'type':
        this.shadowRoot.querySelector('.type').innerHTML = this.getAttribute('type');
        break;
      case 'start':
        this.shadowRoot.querySelector('.start').innerHTML = this.getAttribute('start');
        break;
      case 'end':
        this.shadowRoot.querySelector('.end').innerHTML = this.getAttribute('end');
        break;
    }
  }
}

if (!window.customElements.get('annotation-inspector')) {
  window.customElements.define('annotation-inspector', AnnotationInspector);
}
