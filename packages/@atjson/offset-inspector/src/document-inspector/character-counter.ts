import WebComponent from '../../src/mixins/component';

export default class CharacterCounter extends WebComponent {
  static template = `
    <pre class='content'></pre>
  `;

  static style = `
    :host {
      position: relative;
    }

    .content {
      white-space: pre-wrap;
    }

    .caret-wrapper {
      display: inline;
      position: relative;
      width: 0;
    }

    .caret {
      background-color: rgb(96, 200, 240);
      display: inline-block;
      width: 2px;
      border: 0;
      padding: 0;
      position: absolute;
      left: -1px;
      z-index: -1;
    }

    .highlight {
      background-color: rgb(96, 200, 240);
    }
  `;

  static observedAttributes = ['start', 'end', 'content'];

  updateContent() {
    const start = parseInt(this.getAttribute('start'), 10);
    const end = parseInt(this.getAttribute('end'), 10);
    let contentSpan = this.shadowRoot.querySelector('.content');
    let rawContent = '';
    let contentAttr = this.getAttribute('content');
    if (typeof contentAttr === 'string') {
      rawContent = contentAttr.replace(/\n/g, '¶');
    }
    let content = document.createElement('span');

    let contentStart = document.createTextNode(rawContent.substr(0, start));
    let contentEnd = document.createTextNode(rawContent.substr(end));
    let highlight = document.createElement('span');

    if (start === end) {
      highlight.classList.add('caret-wrapper');
      let caret = document.createElement('span');
      caret.classList.add('caret');
      caret.textContent = '\u200B';
      highlight.appendChild(caret);
    }  else {
      let contentHighlight = document.createTextNode(rawContent.substr(start, end - start));
      highlight.classList.add('highlight');
      highlight.appendChild(contentHighlight);
    }

    content.appendChild(contentStart);
    content.appendChild(highlight);
    content.appendChild(contentEnd);

    if (contentSpan.children[0]) contentSpan.removeChild(contentSpan.children[0]);
    contentSpan.appendChild(content);
  }

  attributeChangedCallback(attribute) {
    switch (attribute) {
      case 'start':
      case 'end':
      case 'content':
        window.requestIdleCallback(() => {
          this.updateContent();
        });
        break;
    }
  }
}

if (!window.customElements.get('character-counter')) {
  window.customElements.define('character-counter', CharacterCounter);
}
