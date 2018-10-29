function getEventNameAndElement(element: HTMLElement, definition: string) {
  let [eventName, ...selectors] = definition.split(' ');
  let selector = selectors.join(' ');
  if (selector === 'document') {
    return { eventName, element: document, getTarget() { return document; } };
  } else if (selector === 'window') {
    return { eventName, element: window, getTarget() { return window; } };
  } else if (selector === '') {
    return { eventName, element, getTarget() { return element; } };
  } else {
    return { eventName, element, getTarget() { return element.shadowRoot!.querySelector(selector) || element.querySelector(selector); } };
  }
}

interface TemplateElement extends HTMLElement {
  content: Node;
}

export function define(name: string, component: typeof HTMLElement) {
  if (!window.customElements.get(name)) {
    window.customElements.define(name, component);
  }
  return component;
}

/**
 * The events mixin is a Backbone-flavored event management system
 * that automatically sets up and tears down events on web components
 * when they are connected and disconnected from a document.
 *
 * To use this, include the events mixin on your web component,
 * and add a static property called `events` that provides a lookup
 * table to the events that you'd like to attach to your component.
 *
 * ```js
 * import Component from './component';
 *
 * export default TextSelection extends Component {
 *   static events = {
 *     'selectionchange document'(evt) => this.selectedTextDidChange();
 *     'mousedown'(evt) => this.willSelectText();
 *     'mouseup'(evt) => this.didSelectText();
 *   };
 * }
 * ```
 *
 * The selectors for `window` and `document` will select only those
 * elements; all other selectors will lookup in the scope of the web
 * component. This allows components to look at events like scrolling,
 * resizing, and selection events without using `addEventListener` /
 * `removeEventListener`.
 */
export default class Component extends HTMLElement {
  static events?: {
    [key: string]: (evt: Event | CustomEvent) => any;
  };
  static template: string;
  static style: string | null;
  static observedAttributes: string[];
  private static compiledElement: TemplateElement;

  private static get compiledTemplate(): TemplateElement {
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

  private eventHandlers: {
    [key: string]: (evt: Event | CustomEvent) => any;
  };

  constructor() {
    super();
    this.eventHandlers = {};
    let ComponentClass = this.constructor as typeof Component;
    let shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(ComponentClass.compiledTemplate.content.cloneNode(true));
    ComponentClass.observedAttributes.forEach(attribute => {
      if (!this.hasOwnProperty(attribute)) {
        Object.defineProperty(this, attribute, {
          enumerable: true,
          get() {
            return this.getAttribute(attribute);
          },
          set(value) {
            if (value === false) {
              this.removeAttribute(attribute);
            } else if (value === true) {
              this.setAttribute(attribute, '');
            } else {
              this.setAttribute(attribute, value);
            }
            return value;
          }
        });
      }
    });
  }

  connectedCallback() {
    let ComponentClass = this.constructor as typeof Component;
    let events = ComponentClass.events || {};
    Object.keys(events).forEach((definition: string) => {
      let { eventName, element, getTarget } = getEventNameAndElement(this, definition);
      let method = events[definition];
      this.eventHandlers[definition] = evt => {
        if (evt.target === getTarget()) {
          return method.call(this, evt);
        } else {
          console.log(`[${typeof method === 'string' ? method : definition}]`, evt.target, '!=', getTarget());
          return true;
        }
      };
      element.addEventListener(eventName, this.eventHandlers[definition], { capture: true });
    });
  }

  disconnectedCallback() {
    Object.keys(this.eventHandlers).forEach(definition => {
      let { eventName, element } = getEventNameAndElement(this, definition);
      element.removeEventListener(eventName, this.eventHandlers[definition]);
    });
    this.eventHandlers = {};
  }
}
