import WebComponent from '../mixins/component';

export default class OffsetHeadingActionButton extends WebComponent {

  static template = '<button><b>H</b></button>';

  static style = `
    :host(.active) button {
      border-color: red;
    }
  `;

  static events = {
    selectionchange: 'onSelectionChange',
    click: 'onClick'
  };

  onSelectionChange(evt: CustomEvent) {
    console.log('selectionchange');
    if (evt.detail.start !== evt.detail.end) {
      if (evt.detail.selectedAnnotations.find(a => a.type === 'heading')) {
        this.classList.add('active');
      } else {
        this.classList.remove('active');
      }
      this.style.display = 'initial';
      this.selection = evt.detail;
    } else {
      evt.preventDefault();
      this.style.display = 'none';
    }
  }

  onClick(evt: MouseEvent) {
    console.log('click')
    let detail = {
      type: 'heading',
      start: parseInt(this.selection.start, 10),
      end: parseInt(this.selection.end, 10),
      attributes: { level: 1 }
    };

    this.dispatchEvent(new CustomEvent('addAnnotation', {
      bubbles: true,
      composed: true,
      detail
    }));
  }
}

if (!window.customElements.get('offset-heading-action-button')) {
  window.customElements.define('offset-heading-action-button', OffsetHeadingActionButton);
}
