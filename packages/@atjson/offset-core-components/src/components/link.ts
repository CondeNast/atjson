import EditableComponent from '../mixins/editable-component';
import './link-editor';

export default class OffsetLink extends EditableComponent {

  static template = `<div class="controls"><link-editor></link-editor></div><a class="link" target="_blank"><slot></slot></a>`;

  static observedAttributes = ['url', 'nofollow'];

  static style = EditableComponent.style + `
    a {
      text-decoration: underline;
      color: blue;
      cursor: text;
    }
  `;

  static events = Object.assign({
    'click .link': 'cancelLinkClick'
  }, EditableComponent.events);

  static annotationName = 'link';

  static elementRenderer(node: any): Element {
    let link = document.createElement('offset-link');
    link.setAttribute('url', node.attributes.url);
    if (node.attributes.nofollow) {
      link.setAttribute('nofollow', '');
    }
    return link;
  }

  cancelLinkClick(evt: MouseEvent) {
    evt.preventDefault();
  }

  attributeChangedCallback(attribute: string) {
    if (!this.shadowRoot) throw new Error('No shadowRoot found!');

    let link = this.shadowRoot.querySelector('a');
    let linkEditor = this.shadowRoot.querySelector('link-editor');

    if (!link) throw new Error('No link (a) element found!');
    if (!linkEditor) throw new Error('No link-editor element found');

    switch (attribute) {
    case 'url':
      link.setAttribute('href', this.getAttribute('url') || '');
      linkEditor.setAttribute('url', this.getAttribute('url') || '');
      break;
    case 'nofollow':
      if (this.hasAttribute('nofollow')) {
        linkEditor.setAttribute('nofollow', '');
      } else {
        linkEditor.removeAttribute('nofollow');
      }
      break;
    }
  }
}

if (!window.customElements.get('offset-link')) {
  window.customElements.define('offset-link', OffsetLink);
}
