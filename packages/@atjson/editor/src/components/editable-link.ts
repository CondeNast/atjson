import EditableComponent from '../mixins/editable-component';
import LinkEditor from './link-editor';

if (!window.customElements.get('link-editor')) {
  window.customElements.define('link-editor', LinkEditor);
}

export default class EditableLink extends EditableComponent {

  static template = `<div class="controls"><link-editor></link-editor></div><a class="text-link" target="_blank"><slot></slot></a>`;

  static observedAttributes = ['url', 'nofollow'];

  static style = EditableComponent.style + `
    a {
      text-decoration: underline;
      color: blue;
      cursor: text;
    }
  `;

  static events = Object.assign({
    'click .text-link': 'cancelLinkClick',
  }, EditableComponent.events);

  static annotationName = 'link';

  static elementRenderer = (node) => {
    let link = document.createElement('editable-link');
    link.setAttribute('url', node.attributes.url);
    if (node.attributes.nofollow) {
      link.setAttribute('nofollow', '');
    }
    return link;
  }

  cancelLinkClick(evt) {
    evt.preventDefault();
  }

  attributeChangedCallback(attribute) {
    let link = this.shadowRoot.querySelector('a');
    let linkEditor = this.shadowRoot.querySelector('link-editor');
    switch (attribute) {
    case 'url':
      link.setAttribute('href', this.getAttribute('url'));
      linkEditor.setAttribute('url', this.getAttribute('url'));
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

if (!window.customElements.get('editable-link')) {
  window.customElements.define('editable-link', EditableLink);
}
