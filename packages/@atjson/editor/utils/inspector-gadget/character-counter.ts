import WebComponent from '../../src/mixins/component';

export default class CharacterCounter extends WebComponent {
  static template = "<pre class='count'><span class='top'></span>\n<span class='bottom'></span></pre><pre><slot></slot></pre>";

  static style = `
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

  static observedAttributes = ['start', 'end', 'length'];

  renderCounter() {
    let start = parseInt(this.getAttribute('start'), 10);
    let end = parseInt(this.getAttribute('end'), 10);

    let topEl = this.shadowRoot.querySelector('.top');
    let topVal = '';

    let bottomEl = this.shadowRoot.querySelector('.bottom');
    let bottomVal = '';

    let length = Math.max(parseInt(this.getAttribute('length'), 10), 1);

    for (let x = 0; x <= length; x++) {
      if (start === x && end === x) {
        bottomVal += '<span class="caret-wrapper"><span class="caret">&#8203;</span></span>';
      } else {
        if (start === x) {
          bottomVal += '<span class="highlight">';
        }

        if (end === x) {
          bottomVal += '</span>';
        }
      }

      bottomVal += x % 10;

      if (x % 10 === 0) {
        topVal += x / 10;
      } else {
        topVal += ' ';
      }
    }

    topEl.innerHTML = topVal;
    bottomEl.innerHTML = bottomVal;
  }

  attributeChangedCallback(attribute) {
    switch (attribute) {
      case 'start':
      case 'end':
      case 'length':
        window.requestAnimationFrame(_ => this.renderCounter());
        break;
    }
  }
}
