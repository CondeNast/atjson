import AtJSONDocument, { Annotation } from '@atjson/document';
import OffsetSource from '@atjson/offset-annotations';
import WebComponentRenderer from '@atjson/renderer-webcomponent';
import Component, { define } from '../component';
import './offset-selection-toolbar';
import './offset-text-input';
import './offset-text-selection';

export interface Range {
  start: number;
  end: number;
}

const TEXT_NODE_TYPE = 3;
type TextRangePoint = [Text | null, number];

function getTextNodes(node: Node): Text[] {
  let nodes: Text[] = [];

  if (node.hasChildNodes()) {
    node.childNodes.forEach((child: Node) => {
      nodes = nodes.concat(getTextNodes(child));
    });
  } else if (node.nodeType === TEXT_NODE_TYPE) {
    nodes.push(node as Text);
  }

  return nodes;
}

function nextTextNode(node: Node): TextRangePoint {
  let nextNode: Node | null = node;
  while (nextNode) {
    let textNodes = getTextNodes(nextNode);
    if (textNodes.length) {
      return [textNodes[0], 0];
    }
    nextNode = nextNode.nextSibling;
  }
  if (node.parentNode) {
    return nextTextNode(node.parentNode);
  }
  return [null, 0];
}

export default define('offset-editor', class OffsetEditor extends Component {
  static template = '<offset-text-input>' +
                      '<offset-text-selection>' +
                        '<offset-selection-toolbar slot="toolbar"></offset-selection-toolbar>' +
                        '<slot></slot>' +
                      '</offset-text-selection>' +
                    '</offset-text-input>';
  static style = `
    .editor {
      white-space: pre-wrap;
    }
  `;
  static events = {
    'change offset-text-selection'(this: OffsetEditor, evt: CustomEvent) {
      return this.handleTextSelectionChange(evt);
    },
    'insertText offset-text-input'(this: OffsetEditor, evt: CustomEvent) {
      return this.handleTextInsert(evt);
    },
    'deleteText offset-text-input'(this: OffsetEditor, evt: CustomEvent) {
      return this.handleTextDelete(evt);
    },
    'replaceText offset-text-input'(this: OffsetEditor, evt: CustomEvent) {
      return this.handleTextReplace(evt);
    },
    'addAnnotation'(this: OffsetEditor, evt: CustomEvent) {
      return this.handleAnnotationAdd(evt);
    },
    'deleteAnnotation'(this: OffsetEditor, evt: CustomEvent) {
      return this.handleAnnotationDelete(evt);
    },
    'attributechange'(this: OffsetEditor, evt: CustomEvent) {
      return this.handleAttributeChange(evt);
    }
  };

  selection: Range;
  private document: AtJSONDocument;

  constructor() {
    super();
    this.document = new OffsetSource({
      content: '',
      annotations: []
    });
    this.selection = { start: 0, end: 0 };
  }

  set value(value: AtJSONDocument) {
    this.document = value;
    this.innerHTML = '<div class="editor" contenteditable></div>';
    this.render(this.querySelector('.editor'));
    this.document.addEventListener('change', () => this.scheduleRender());
  }

  get value() {
    return this.document;
  }

  scheduleRender() {
    window.requestAnimationFrame(() => {
      let editor = this.querySelector('.editor');

      if (editor !== null) {
        this.render(editor);
        let evt = new CustomEvent('change', { bubbles: true, composed: true, detail: { value: this.value } });
        this.dispatchEvent(evt);
      }
    });
  }

  render(editor: Element | null) {
    if (!editor) return;

    let rendered = new WebComponentRenderer().render(this.value);

    // This can be improved by doing the comparison on an element-by-element
    // basis (or by rendering incrementally via the HIR), but for now this will
    // prevent flickering of OS UI elements (e.g., spell check) while typing
    // characters that don't result in changes outside of text elements.
    if (rendered.innerHTML !== editor.innerHTML) {
      editor.replaceWith(rendered);

      if (this.selection) {
        let textSelection: TextSelection | null = this.querySelector('offset-text-selection');
        if (textSelection) {
          textSelection.setSelection(this.selection);
          // textSelection.setSelection(this.selection, { suppressEvents: true });
        }
      }
    }
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
    super.connectedCallback();
    this.innerHTML = '<div class="editor" contenteditable></div>';
    this.render(this.querySelector('.editor'));
    this.observer = new MutationObserver(() => this.reset());
    debugger;
    this.observer.observe(this, {
      childList: true,
      characterData: true,
      subtree: true
    });
    this.reset();
  }

  reset() {
    debugger;
    this.shadowRoot.querySelector('offset-text-selection').textNodes = getTextNodes(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.shadowRoot.querySelector('offset-text-selection').textNodes = [];
  }

  handleTextSelectionChange(evt: CustomEvent) {
    this.selection = evt.detail;

    let selectionChangeEvent = new CustomEvent('selectionchange', {
      detail: Object.assign({
        selectedAnnotations: this.value.where(annotation => {
          return annotation.isOverlapping(evt.detail.start, evt.detail.end);
        }),
        value: this.value
      }, evt.detail),
      bubbles: false
    });

    let toolbar = this.querySelector('selection-toolbar');
    if (toolbar) toolbar.dispatchEvent(selectionChangeEvent);
  }

  handleTextInsert(evt: CustomEvent) {
    this.value.insertText(evt.detail.position, evt.detail.text);
    this.selection.start += evt.detail.text.length;
    this.selection.end += evt.detail.text.length;
  }

  handleTextDelete(evt: CustomEvent) {
    let deletion = evt.detail;
    this.value.deleteText(deletion.start, deletion.end);
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

    this.value.deleteText(replacement.start, replacement.end);
    this.value.insertText(replacement.start, replacement.text);
    this.selection.start = replacement.start + replacement.text.length;
  }

  handleAnnotationAdd(evt: CustomEvent) {
    if (evt.detail.type === 'bold' || evt.detail.type === 'italic') {

      const contained = (a: Annotation, b: Annotation) => a.start >= b.start && a.end <= b.end;
      const offset = (a: Annotation, b: Annotation) => a.start <= b.end && a.end >= b.start;
      let overlapping = this.value.annotations.filter((a: Annotation) => a.type === evt.detail.type)
                                                  .filter((a: Annotation) => contained(a, evt.detail) || contained(evt.detail, a) || offset(a, evt.detail) || offset(evt.detail, a));

      let min = overlapping.reduce((a: number, b: Annotation) => Math.min(a, b.start), this.value.content.length);
      let max = overlapping.reduce((a: number, b: Annotation) => Math.max(a, b.end), 0);

      if (overlapping.length === 0) {
        this.value.addAnnotations(evt.detail);

      } else if (min <= evt.detail.start && evt.detail.end <= max && overlapping.length === 1) {
        // invert the state.
        let prev = overlapping[0];
        let newFirst = Object.assign({}, prev, evt.detail, { start: prev.start, end: evt.detail.start });
        let newLast = Object.assign({}, prev, evt.detail, { start: evt.detail.end, end: prev.end });
        if (min !== evt.detail.start) this.value.addAnnotations(newFirst);
        if (max !== evt.detail.end) this.value.addAnnotations(newLast);

      } else {
        this.value.addAnnotations(Object.assign({}, overlapping[0], evt.detail, { start: Math.min(min, evt.detail.start), end: Math.max(max, evt.detail.end) }));
      }

      overlapping.forEach((o: Annotation) => this.value.removeAnnotation(o));

    } else {
      this.value.addAnnotations(evt.detail);
    }
  }

  handleAnnotationDelete(evt: CustomEvent) {
    let annotation = this.value.annotations.find((a: Annotation) => a.id === evt.detail.annotationId);
    if (annotation) this.value.removeAnnotation(annotation);
  }

  handleAttributeChange(evt: CustomEvent) {
    if (evt.detail.annotationId) {
      let annotation = this.value.annotations.find((a: Annotation) => a.id === evt.detail.annotationId);
      if (annotation) {
        let newAnnotation = Object.assign(annotation, {attributes: evt.detail.attributes});
        this.value.replaceAnnotation(annotation, newAnnotation);
      }
    } else if (evt.target instanceof Element) {
      let annotationId = evt.target.getAttribute('data-annotation-id');
      let annotation = this.value.annotations.find((a: Annotation) => a.id !== undefined && a.id.toString() === annotationId);
      if (annotation) {
        this.value.replaceAnnotation(annotation, Object.assign(annotation, evt.detail));
      }
    }
  }
});
