export type EventCallback = (evt: Event) => boolean;

export interface EventHandlerDefinitions {
  [key: string]: string | EventCallback;
}

export interface EventHandlerReferences {
  [key: string]: EventCallback;
}

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
 * import events from './mixins/events';
 *
 * export default TextSelection extends events(HTMLElement) {
 *   static events = {
 *     'selectionchange document': 'selectedTextDidChange',
 *     'mousedown': 'willSelectText',
 *     'mouseup': 'didSelectText'
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
export default class EventComponent extends HTMLElement {
  static events: EventHandlerDefinitions | null;
  private eventHandlers: EventHandlerReferences;

  [key: string]: any;

  constructor() {
    super();
    this.eventHandlers = {};
  }

  connectedCallback() {
    let ComponentClass = this.constructor as typeof EventComponent;
    let events: EventHandlerDefinitions = ComponentClass.events || {};
    Object.keys(events).forEach((definition: string) => {
      let { eventName, element } = getEventNameAndElement(this, definition);
      let method = events[definition];
      this.eventHandlers[definition] = (evt): boolean | never => {
        if (typeof method === 'string') {
          const eventHandler: (event: Event) => boolean | never = this[method];
          if (eventHandler instanceof Function) {
            return eventHandler.call(this, evt);
          } else {
            throw new Error(`😭 \`${method}\` was not defined on ${this.tagName}- did you misspell  or forget to add it?`);
          }
        } else {
          return method.call(this, evt);
        }
      };
      element.addEventListener(eventName, this.eventHandlers[definition]);
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
