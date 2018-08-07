import WebComponent from '../mixins/component';

export default class FontEditor extends WebComponent {

  static template = `<label>Font</label> <input type="text" name="font-family" class="font-family" /> <label>Size</label> <input type="text" name="font-size" class="font-size" /> &nbsp; <button class="cancel">❌</button><button class="save">✔️</button>&nbsp;`;

  static events = {
    'beforeinput': 'beforeInput',
    'click .cancel': 'cursorBlur',
    'click .save': 'onSave',
    'keypress .font-family': 'handleKeypress',
    'keypress .font-size': 'handleKeypress'
  };

  static observedAttributes = ['font-family', 'font-size'];

  static style = `
    :host {
      display: flex;
    }
  `;

  beforeInput(evt: Event) {
    evt.stopPropagation();
  }

  handleKeypress(evt: KeyboardEvent) {
    if (evt.keyCode === 13) {
      this.onSave(evt);
    }
  }

  onSave(evt: Event) {
    let fontFamily = this.shadowRoot.querySelector('.font-family');
    this.setAttribute('font-family', fontFamily.value);

    let fontSize = this.shadowRoot.querySelector('.font-size');
    this.setAttribute('font-size', fontSize.value);

    this.dispatchEvent(new CustomEvent('attributechange', {
      bubbles: true,
      composed: true,
      detail: {
        attributes: {
          'font-family': fontFamily.value,
          'font-size': fontSize.value
        }
      }
    }));

    this.dispatchEvent(new CustomEvent('resumeinput', { bubbles: true, composed: true }));

    evt.stopPropagation();
  }

  attributeChangedCallback(attribute: string) {
    switch (attribute) {
      case 'font-family':
        let fontFamily = this.shadowRoot.querySelector('.font-family');
        fontFamily.setAttribute('value', this.getAttribute('font-family'));
        break;
      case 'font-size':
        let fontSize = this.shadowRoot.querySelector('.font-size');
        fontSize.setAttribute('value', this.getAttribute('font-size'));
        break;
    }
  }
}

if (!window.customElements.get('font-editor')) {
  window.customElements.define('font-editor', FontEditor);
}
