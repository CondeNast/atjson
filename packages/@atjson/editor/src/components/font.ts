import EditableComponent from '../mixins/editable-component';
import './font-editor';

export default class OffsetFont extends EditableComponent {

  static template = `<div class="controls"><font-editor></font-editor></div><span class="font"><slot></slot></span>`;

  static observedAttributes = ['font-family', 'font-size'];

  static annotationName = 'font';

  static elementRenderer(node: any): Element {
    let el = document.createElement('offset-font');
    if (node.attributes['font-family']) {
      el.setAttribute('font-family', node.attributes['font-family']);
    }

    if (node.attributes['font-size']) {
      el.setAttribute('font-size', node.attributes['font-size']);
    }

    return el;
  }

  attributeChangedCallback(attribute: string) {
    let el: HTMLSpanElement = this.shadowRoot.querySelector('.font');
    let editor = this.shadowRoot.querySelector('font-editor');
    switch (attribute) {
    case 'font-family':
      let family = this.getAttribute('font-family');
      if (family) {
        el.style.fontFamily = family;
        editor.setAttribute('font-family', family);
      } else {
        el.style.fontFamily = '';
        editor.removeAttribute('font-family');
      }
      break;

    case 'font-size':
      let size = this.getAttribute('font-size');
      if (size) {
        el.style.fontSize = size;
        editor.setAttribute('font-size', size);
      } else {
        el.style.fontSize = '';
        editor.removeAttribute('font-size');
      }
      break;
    }
  }
}

if (!window.customElements.get('offset-font')) {
  window.customElements.define('offset-font', OffsetFont);
}
