import Document, { Annotation } from '@atjson/document';
import WebComponentRenderer from '@atjson/renderer-webcomponent';
import EventComponent from './mixins/events';
import './selection-toolbar';
import './text-input';
import TextSelection from './text-selection';
import './text-selection';

export interface Range {
  start: number;
  end: number;
}

export default class OffsetEditor extends EventComponent {

  static template = '<text-input>' +
                      '<text-selection>' +
                        '<selection-toolbar slot="toolbar"></selection-toolbar>' +
                        '<div class="editor" style="white-space: pre-wrap" contenteditable></div>' +
                      '</text-selection>' +
                    '</text-input>';

  static events = {
    'change text-selection': 'handleTextSelectionChange',
    'insertText text-input': 'handleTextInsert',
    'deleteText text-input': 'handleTextDelete',
    'replaceText text-input': 'handleTextReplace',
    'addAnnotation': 'handleAnnotationAdd',
    'deleteAnnotation': 'handleAnnotationDelete',
    'attributechange': 'handleAttributeChange'
  };

  selection: Range;
  document: Document;

  constructor() {
    super();
    this.document = new Document('');
    this.selection = { start: 0, end: 0 };
  }

  get value() {
    return this.document;
  }

  scheduleRender() {
    window.requestAnimationFrame(() => {
      let editor = this.querySelector('.editor');

      if (editor !== null) {
        this.render(editor);
        let evt = new CustomEvent('change', { bubbles: true, composed: true, detail: { document: this.document } });
        this.dispatchEvent(evt);
      }
    });
  }

  render(editor: Element | null) {
    if (!editor) return;

    let rendered = new WebComponentRenderer(this.document).render();

    // This can be improved by doing the comparison on an element-by-element
    // basis (or by rendering incrementally via the HIR), but for now this will
    // prevent flickering of OS UI elements (e.g., spell check) while typing
    // characters that don't result in changes outside of text elements.
    if (rendered.innerHTML !== editor.innerHTML) {
      editor.innerHTML = rendered.innerHTML;

      if (this.selection) {
        let textSelection: TextSelection | null = this.querySelector('text-selection');
        if (textSelection) {
          textSelection.setSelection(this.selection);
          // textSelection.setSelection(this.selection, { suppressEvents: true });
        }
      }
    }
  }

  setDocument(value: Document) {
    this.document = value;

    // n.b., would be good to have a way to query for existence of id on
    // annotation (or to make ids required globally)
    this.document.where({}).update(a => {
      if (a.id == null) {
        // this is not safe.
        a.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      }
    });

    this.document.addEventListener('change', (() => this.scheduleRender() ));
  }

  addContentFeature(component: any) {
    this.selectionToolbar.appendChild(component.selectionButton);

    if (component.annotationName) {
      WebComponentRenderer.prototype[component.annotationName] = component.elementRenderer;
    }
  }

  getSelection() {
    return this.querySelector('text-selection');
  }

  private get selectionToolbar() {
    let selectionToolbar = this.querySelector('selection-toolbar');
    if (!selectionToolbar) throw new Error('Could not find selection-toolbar.');
    if (!selectionToolbar.shadowRoot) throw new Error('Expected selectionToolbar to have shadowRoot.');
    return selectionToolbar;
  }

  connectedCallback() {
    // n.b. this was this.constructor.template but typescript doesn't like that... for now no inheritance :(
    this.innerHTML = OffsetEditor.template;
    super.connectedCallback();
    this.render(this.querySelector('.editor'));
  }

  handleTextSelectionChange(evt: CustomEvent) {
    this.selection = evt.detail;

    let selectedAnnotations = this.document.annotations.filter((a: Annotation) => {
      return (a.start <= evt.detail.start && a.end >= evt.detail.start) ||
              (a.start <= evt.detail.end && a.end >= evt.detail.end);
    });

    let selectionChangeEvent = new CustomEvent('selectionchange', {
      detail: Object.assign({
        selectedAnnotations,
        document: this.document
      }, evt.detail),
      bubbles: false
    });

    let toolbar = this.querySelector('selection-toolbar');
    if (toolbar) toolbar.dispatchEvent(selectionChangeEvent);
  }

  handleTextInsert(evt: CustomEvent) {
    this.document.insertText(evt.detail.position, evt.detail.text);
    this.selection.start += evt.detail.text.length;
    this.selection.end += evt.detail.text.length;
  }

  handleTextDelete(evt: CustomEvent) {
    let deletion = evt.detail;
    this.document.deleteText(deletion);
    // FIXME the selection should just be an annotation that we transform. We shouldn't handle logic here.
    if (this.selection.start < deletion.start) {
      // do nothing.
    } else if (this.selection.start < deletion.end) {
      this.selection.start = this.selection.end = deletion.start;
    } else {
      let l = deletion.end - deletion.start;
      this.selection.start -= l;
      this.selection.end -= l;
    }
  }

  handleTextReplace(evt: CustomEvent) {
    let replacement = evt.detail;

    this.document.deleteText(replacement);
    this.document.insertText(replacement.start, replacement.text);
    this.selection.start = replacement.start + replacement.text.length;
  }

  handleAnnotationAdd(evt: CustomEvent) {
    if (evt.detail.type === 'bold' || evt.detail.type === 'italic') {

      const contained = (a: Annotation, b: Annotation) => a.start >= b.start && a.end <= b.end;
      const offset = (a: Annotation, b: Annotation) => a.start <= b.end && a.end >= b.start;
      let overlapping = this.document.annotations.filter((a: Annotation) => a.type === evt.detail.type)
                                                  .filter((a: Annotation) => contained(a, evt.detail) || contained(evt.detail, a) || offset(a, evt.detail) || offset(evt.detail, a));

      let min = overlapping.reduce((a: number, b: Annotation) => Math.min(a, b.start), this.document.content.length);
      let max = overlapping.reduce((a: number, b: Annotation) => Math.max(a, b.end), 0);

      if (overlapping.length === 0) {
        this.document.addAnnotations(evt.detail);

      } else if (min <= evt.detail.start && evt.detail.end <= max && overlapping.length === 1) {
        // invert the state.
        let prev = overlapping[0];
        let newFirst = Object.assign({}, prev, evt.detail, { start: prev.start, end: evt.detail.start });
        let newLast = Object.assign({}, prev, evt.detail, { start: evt.detail.end, end: prev.end });
        if (min !== evt.detail.start) this.document.addAnnotations(newFirst);
        if (max !== evt.detail.end) this.document.addAnnotations(newLast);

      } else {
        this.document.addAnnotations(Object.assign({}, overlapping[0], evt.detail, { start: Math.min(min, evt.detail.start), end: Math.max(max, evt.detail.end) }));
      }

      overlapping.forEach((o: Annotation) => this.document.removeAnnotation(o));

    } else {
      this.document.addAnnotations(evt.detail);
    }
  }

  handleAnnotationDelete(evt: CustomEvent) {
    let annotation = this.document.annotations.find((a: Annotation) => a.id === evt.detail.annotationId);
    if (annotation) this.document.removeAnnotation(annotation);
  }

  handleAttributeChange(evt: CustomEvent) {
    if (evt.detail.annotationId) {
      let annotation = this.document.annotations.find((a: Annotation) => a.id === evt.detail.annotationId);
      if (annotation) {
        let newAnnotation = Object.assign(annotation, {attributes: evt.detail.attributes});
        this.document.replaceAnnotation(annotation, newAnnotation);
      }
    } else if (evt.target instanceof Element) {
      let annotationId = evt.target.getAttribute('data-annotation-id');
      let annotation = this.document.annotations.find((a: Annotation) => a.id !== undefined && a.id.toString() === annotationId);
      if (annotation) {
        this.document.replaceAnnotation(annotation, Object.assign(annotation, evt.detail));
      }
    }
  }
}

if (!window.customElements.get('offset-editor')) {
  window.customElements.define('offset-editor', OffsetEditor);
}
