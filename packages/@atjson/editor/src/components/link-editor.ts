import WebComponent from '../mixins/component';

export default class LinkEditor extends WebComponent {

  static template = `<a target="_blank">🔗</a>&nbsp;<div class="default"><input type="text" class="urlinput" /></div><div class="extended"><input type="checkbox" name="nofollow" class="nofollow" /><label for="nofollow">No&nbsp;Follow</label></div>&nbsp; <button class="config">⚙️</button><button class="cancel">❌</button><button class="save">✔️</button>&nbsp;`;

  static events = {
    'beforeinput': 'beforeInput',
    'click .cancel': 'cursorBlur',
    'click .save': 'onSave',
    'click .config': 'onConfig',
    'keypress .urlinput': 'handleKeypress'
  };

  static observedAttributes = ['url', 'nofollow'];

  static style = `
    :host {
      display: flex;
    }

    .extended {
      display: none;
      width: max-content;
    }

    :host(.config) .default {
      display: none;
    }

    :host(.config) .extended {
      display: block;
    }

    :host(.config) button.config {
      background: darkgrey;
    }
  `;

  onConfig() {
    this.classList.toggle('config');
  }

  beforeInput(evt) {
    evt.stopPropagation();
  }

  handleKeypress(evt) {
    if (evt.keyCode === 13) {
      this.onSave(evt);
    }
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

    console.log('dispatching attributechange event');
    this.dispatchEvent(new CustomEvent('attributechange', {
      bubbles: true,
      composed: true,
      detail: {
        attributes: {
          url: link.value,
          nofollow: nofollow.checked
        }
      }
    }));

    this.dispatchEvent(new CustomEvent('resumeinput', { bubbles: true, composed: true }));

    evt.stopPropagation();
  }

  attributeChangedCallback(attribute) {
    let input = this.shadowRoot.querySelector('.urlinput');
    let nofollow = this.shadowRoot.querySelector('.nofollow');
    switch (attribute) {
      case 'url':
        input.setAttribute('value', this.getAttribute('url'));
        break;
      case 'nofollow':
        nofollow.checked = this.hasAttribute('nofollow');
        break;
    }
  }
}

if (!window.customElements.get('link-editor')) {
  window.customElements.define('link-editor', LinkEditor);
}
