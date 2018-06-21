import WebComponent from '../../mixins/component';

export default class EditableLink extends WebComponent {
  static template = `<div class="controls"><a target="_blank">🔗</a>&nbsp;<div class="default"><input type="text" class="urlinput" /></div><div class="extended"><input type="checkbox" name="nofollow" class="nofollow" /><label for="nofollow">No&nbsp;Follow</label></div>
   &nbsp; <button class="config">⚙️</button><button class="cancel">❌</button><button class="save">✔️</button>&nbsp;</div><a class="text-link" target="_blank"><slot></slot></a>`;

  static observedAttributes = ['url', 'nofollow'];

  static events = {
    'beforeinput': 'beforeInput',
    'cursorfocus': 'cursorFocus',
    'cursorblur': 'cursorBlur',
    'click .text-link': 'cancelLinkClick',
    'click .cancel': 'cursorBlur',
    'click .save': 'onSave',
    'click .config': 'onConfig',
    'keypress .urlinput': 'handleKeypress'
  }

  static style = `
    :host {
      position: relative;
      outline: none;
    }

    .controls {
      display: none;
      position: absolute;
      top: -2.5em;
      right: -10em;
      height: 1.5em;
      vertical-align: baseline;
      background-color: white;
      padding: 3px;
      border: 1px solid black;
      border-radius: 5px;
      white-space: normal;
    }

    a {
      text-decoration: underline;
    }

    .controls .extended {
      display: none;
      width: max-content;
    }

    :host(.cursorfocus) .controls {
      display: flex;
    }

    :host(.config) .controls .default {
      display: none;
    }

    :host(.config) .controls .extended {
      display: block;
    }

    :host(.config) button.config {
      background: darkgrey;
    }
  `;

  url: string;
  nofollow: boolean;

  cursorFocus() {
    this.classList.add('cursorfocus');
  }

  cursorBlur() {
    console.trace('got cursor blur??');
    this.classList.remove('cursorfocus');
    this.classList.remove('config');
  }

  cancelLinkClick(evt) {
    evt.preventDefault();
  }

  handleKeypress(evt) {
    if (evt.keyCode === 13) {
      this.onSave(evt);
    }
  }

  beforeInput(evt) {
    evt.stopPropagation();
  }

  onConfig() {
    this.classList.toggle('config');
  }

  onSave(evt) {
    let link = this.shadowRoot.querySelector('.urlinput');
    this.setAttribute('url', link.value);

    let nofollow = this.shadowRoot.querySelector('.nofollow');
    if (nofollow.checked) {
      this.setAttribute('nofollow', '');
    } else {
      this.removeAttribute('nofollow');
    }

    console.log(nofollow);

    this.dispatchEvent(new CustomEvent('attributechange', { bubbles: true, detail: {
      attributes: {
        url: link.value,
        nofollow: nofollow.checked
      }
    }}));

    this.cursorBlur();
    evt.stopPropagation();
  }

  attributeChangedCallback(attribute) {
    let link = this.shadowRoot.querySelector('a');
    let input = this.shadowRoot.querySelector('.urlinput');
    let nofollow = this.shadowRoot.querySelector('.nofollow');
    switch (attribute) {
    case 'url':
      link.setAttribute('href', this.getAttribute('url'));
      input.setAttribute('value', this.getAttribute('url'));
      break;
    case 'nofollow':
      nofollow.checked = this.hasAttribute('nofollow');
      break;
    }
  }
}
