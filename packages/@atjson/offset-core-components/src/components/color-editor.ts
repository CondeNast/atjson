import WebComponent from '../mixins/component';

export default class ColorEditor extends WebComponent {

  static template = `<label>Color</label> <input type="color" name="text-color" class="text-color" /> <label>Background</label> <input type="color" name="background-color" class="background-color" /> &nbsp; <button class="cancel">❌</button><button class="save">✔️</button>&nbsp;`;

  static events = {
    'beforeinput': 'beforeInput',
    'click .cancel': 'cursorBlur',
    'click .save': 'onSave',
    'keypress .text-color': 'handleKeypress',
    'keypress .background-color': 'handleKeypress'
  };

  static observedAttributes = ['text-color', 'background-color'];

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
    let textColor = this.shadowRoot.querySelector('.text-color');
    this.setAttribute('text-color', textColor.value);
    let backgroundColor = this.shadowRoot.querySelector('.background-color');
    this.setAttribute('background-color', backgroundColor.value);

    this.dispatchEvent(new CustomEvent('attributechange', {
      bubbles: true,
      composed: true,
      detail: {
        attributes: {
          'text-color': textColor.value,
          'background-color': backgroundColor.value
        }
      }
    }));

    this.dispatchEvent(new CustomEvent('resumeinput', { bubbles: true, composed: true }));

    evt.stopPropagation();
  }

  attributeChangedCallback(attribute: string) {
    switch (attribute) {
      case 'text-color':
        let textColor = this.shadowRoot.querySelector('.text-color');
        textColor.setAttribute('value', this.getAttribute('text-color'));
        break;
      case 'background-color':
        let backgroundColor = this.shadowRoot.querySelector('.background-color');
        backgroundColor.setAttribute('value', this.getAttribute('background-color'));
        break;
    }
  }
}

if (!window.customElements.get('color-editor')) {
  window.customElements.define('color-editor', ColorEditor);
}
