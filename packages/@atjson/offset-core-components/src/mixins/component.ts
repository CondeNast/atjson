import events from './events';

export default class WebComponent extends events(HTMLElement) {
  static template: string;
  static style: string | null;
  private static compiledElement: Element;

  private static get compiledTemplate(): Element {
    if (!this.compiledElement) {
      this.compiledElement = document.createElement('template');
      let scopedStyles = this.style;
      let html = this.template;
      if (scopedStyles) {
        html = `<style>${scopedStyles}</style>${html}`;
      }
      this.compiledElement.innerHTML = html;
    }
    return this.compiledElement;
  }

  shadowRoot: ShadowRoot;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.constructor.compiledTemplate.content.cloneNode(true));
  }

  dispatchAttributeChangeEvent(attributes: {}) {
    let event = new CustomEvent('attributechange', {
      detail: attributes,
      bubbles: true
    });
    this.dispatchEvent(event);
  }
}
