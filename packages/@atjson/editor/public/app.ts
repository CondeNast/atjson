import OffsetSource, { Bold, Italic, Link, Paragraph, Underline } from '@atjson/offset-annotations';
import Component, { define } from '../src/component';
import '../src/components/offset-editor';
import '../src/components/text-selection';
import './logo';

// Web components in the registry can't be redefined,
// so reload the page on every change
if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload();
  });
}

define('offset-bold', class Bold extends Component {
  static template = '<strong><slot></slot></strong>';
});

define('offset-underline', class Underline extends Component {
  static template = '<slot></slot>';
  static style = `:host {
    text-decoration: underline;
  }`;
});

define('offset-italic', class Italic extends Component {
  static template = '<em><slot></slot></em>';
});

define('offset-paragraph', class Paragraph extends Component {
  static template = '<p><slot></slot></p>';
});

define('offset-link', class Link extends Component {
  static observedAttributes = ['url'];
  static template = '<a><slot></slot></a>';
  static events = {
    'click a'(evt: MouseEvent) {
      evt.preventDefault();
      return false;
    }
  };

  url: string;
  attributeChangedCallback() {
    this.shadowRoot.querySelector('a').setAttribute('href', this.getAttribute('url'));
  }
});

document.addEventListener('DOMContentLoaded', () => {

  let editor: OffsetEditor = document.querySelector('offset-editor');

  let param = new URL(location.toString()).searchParams.get('document');
  if (param) {
    editor.setDocument(new OffsetSource(JSON.parse(param)));
  } else {
    let doc = new OffsetSource({
      content: 'Some text that is both bold and italic plus something after.',
      annotations: [
        new Bold({ start: 23, end: 31 }),
        new Link({ start: 20, end: 24, attributes: { url: 'https://google.com' } }),
        new Italic({ start: 28, end: 38 }),
        new Underline({ start: 28, end: 38 }),
        new Paragraph({ start: 0, end: 61 })
      ]
    });

    editor.setDocument(doc);
  }
});
