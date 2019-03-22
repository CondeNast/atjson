function getEventNameAndElement(element: HTMLElement, definition: string) {
  let [eventName, ...selectors] = definition.split(' ');
  let selector = selectors.join(' ');
  if (selector === 'document') {
    return { eventName, element: document };
  } else if (selector === 'window') {
    return { eventName, element: window };
  } else if (selector === '') {
    return { eventName, element };
  } else {
    let querySelector;
    if (element.shadowRoot) {
      querySelector = element.shadowRoot.querySelector(selector) || element.querySelector(selector);
    } else {
      querySelector = element.querySelector(selector);
    }
    return { eventName, element: querySelector };
  }
}

export interface TemplateElement extends HTMLElement {
  content: Node;
}

export function define<T extends typeof HTMLElement>(name: string, component: T): T {
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
 * ```js
 * import { Component } from '@atjson/offset';
 *
 * export default TextSelection extends Component {
 *   static events = {
 *     'selectionchange document'(this: TextSelection, evt: SelectionEvent) {},
 *     'mousedown'(this: TextSelection, evt: MouseEvent) {},
 *     'mouseup'(this: TextSelection, evt: MouseUp) {}
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
    [key: string]: (evt?: Event | CustomEvent) => any;
  };
  static template: string;
  static style: string | null;
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
    [key: string]: (evt?: Event | CustomEvent) => any;
  };

  constructor() {
    super();
    this.eventHandlers = {};
    let ComponentClass = this.constructor as typeof Component;
    let shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(ComponentClass.compiledTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    let ComponentClass = this.constructor as typeof Component;
    let events = ComponentClass.events || {};
    Object.keys(events).forEach((definition: string) => {
      let { eventName, element } = getEventNameAndElement(this, definition);
      if (element) {
        let method = events[definition];
        this.eventHandlers[definition] = evt => {
          return method.call(this, evt);
        };
        element.addEventListener(eventName, this.eventHandlers[definition]);
      }
    });
  }

  disconnectedCallback() {
    Object.keys(this.eventHandlers).forEach(definition => {
      let { eventName, element } = getEventNameAndElement(this, definition);
      if (element) {
        element.removeEventListener(eventName, this.eventHandlers[definition]);
      }
    });
    this.eventHandlers = {};
  }
}
