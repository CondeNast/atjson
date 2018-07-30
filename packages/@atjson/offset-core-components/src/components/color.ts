import EditableComponent from '../mixins/editable-component';
import './color-editor';

export default class OffsetColor extends EditableComponent {

  static template = `<div class="controls"><color-editor></color-editor></div><span class="color"><slot></slot></span>`;

  static observedAttributes = ['text-color', 'background-color'];

  static annotationName = 'color';

  static elementRenderer(node: any): Element {
    let el = document.createElement('offset-color');
    if (node.attributes['text-color']) {
      el.setAttribute('text-color', node.attributes['text-color']);
    }

    if (node.attributes['background-color']) {
      el.setAttribute('background-color', node.attributes['background-color']);
    }

    return el;
  }

  attributeChangedCallback(attribute: string) {
    let el: HTMLSpanElement = this.shadowRoot.querySelector('.color');
    let editor = this.shadowRoot.querySelector('color-editor');
    switch (attribute) {
    case 'text-color':
      let color = this.getAttribute('text-color');
      if (color) {
        el.style.color = color;
        editor.setAttribute('text-color', color);
      } else {
        el.style.color = '';
        editor.removeAttribute('text-color');
      }
      break;

    case 'background-color':
      let backgroundColor = this.getAttribute('background-color');
      if (backgroundColor) {
        el.style.backgroundColor = backgroundColor;
        editor.setAttribute('background-color', backgroundColor);
      } else {
        el.style.backgroundColor = '';
        editor.removeAttribute('background-color');
      }
      break;
    }
  }
}

if (!window.customElements.get('offset-color')) {
  window.customElements.define('offset-color', OffsetColor);
}
