import Component, { define } from '../component';

export default define('offset-selection-toolbar', class SelectionToolbar extends Component {
  static template = ``;

  static style = `
    :host {
      border-radius: 4px;
    }
  `;

  static events = {
    selectionchange(this: SelectionToolbar, evt: CustomEvent) {
      return this.onSelectionChange(evt);
    }
  };

  // Bubble down the selection change event so that the button can decide if it
  // should be visible or not.
  onSelectionChange(evt: CustomEvent) {
    if (!this.shadowRoot) return;

    this.shadowRoot.childNodes.forEach(element => {
      let event = new CustomEvent(evt.type, { bubbles: false, cancelable: true, detail: evt.detail });
      element.dispatchEvent(event);
    });
  }
});
