import WebComponent from './component';

export default class EditableComponent extends WebComponent {

  static style = `
    :host {
      position: relative;
      outline: none;
    }

    @keyframes showControls {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .controls {
      position: absolute;
      top: -2.5em;
      left: 0;
      height: 1.5em;
      vertical-align: baseline;
      background-color: white;
      padding: 3px;
      border: 1px solid black;
      white-space: normal;
    }

    :host(:not(.cursorfocus)) .controls {
      display: none;
    }

    :host(.cursorfocus) .controls {
      animation: showControls 200ms ease-in-out both;
      display: flex;
    }`;

  static events = {
    'cursorfocus': 'cursorFocus',
    'cursorblur': 'cursorBlur',
  };

  static get selectionButton() {
    var el = document.createElement('button');
    el.setAttribute('data-type', this.annotationName);
    el.innerHTML = this.annotationName;
    return el;
  }

  static elementRenderer = (node) => {
    throw new Error('Element Renderer must be overriden');
  }

  cursorFocus() {
    this.classList.add('cursorfocus');
  }

  cursorBlur() {
    this.classList.remove('cursorfocus');
  }
}
