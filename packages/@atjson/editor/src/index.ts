import { HIR } from '@atjson/hir';
import Document from '@atjson/document';
import events from './mixins/events';
import './text-selection';
import './text-input';

const TEXT_NODE_TYPE = 3;

type Element = TextNode | HTMLElement;

function compile(editor: Editor, hir: Map<Element, HIRNode>, nodes: HIRNode[]): Element[] {
  return nodes.map((node: HIRNode) => {
    let children = node.children();
    if (children.length > 0) {
      let element = editor[node.type](node);
      hir.set(element, node);
      compile(editor, hir, children).forEach((child: Element) => {
        element.appendChild(child);
      });
      return element;
    }
    let text = editor[node.type](node);
    hir.set(text, node);
    return text;
  });
}

export default class Editor extends events(HTMLElement) {
  static template = '<text-input><text-selection><div class="editor" style="white-space: pre-wrap; padding: 1em;" contenteditable></div></text-selection></text-input>' +
                    '<hr/><div class="output" style="white-space: pre-wrap"></div>' +
                    '<hr/><div class="json"></div>';
  static events = {
    'change text-selection'(evt) {
      this.selection = evt.detail;
      this.scheduleRender();
    },

    'insertText text-input'(evt) {
      this.document.insertText(evt.detail.position, evt.detail.text);
      this.selection.start += evt.detail.text.length;
      this.selection.end += evt.detail.text.length;
      this.scheduleRender();
    },

    'deleteText text-input'(evt) {
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
      this.scheduleRender();
    },

    'replaceText text-input'(evt) {
      let replacement = evt.detail;

      this.document.deleteText(replacement);
      this.document.insertText(replacement.start, replacement.text);
      this.selection.start = replacement.start + replacement.text.length;

      this.scheduleRender();
    },

    'addAnnotation text-input'(evt) {
      this.document.addAnnotations(evt.detail);
      this.scheduleRender();
    }

  };

  scheduleRender() {
    window.requestAnimationFrame(() => {
      this.render(this.querySelector('.editor'));
      this.render(this.querySelector('.output'));
      this.renderJson(this.querySelector('.json'));
    });
  }

  text({ text }) {
    if (text[text.length - 1] == "\n") {
      var nonBreakStrings = text.split("\n");
      console.log('+++--->' + text + '<---+++', '->',nonBreakStrings);
      if (nonBreakStrings[nonBreakStrings.length - 1] == '') {
        nonBreakStrings.pop();
      }
      var children = nonBreakStrings.map((str) => {
        var span = document.createElement('span');
        span.style.whiteSpace = 'normal';
        span.style.display = 'none';
        span.contentEditable = false;
        span.appendChild(document.createTextNode("\n"));
        console.log(span);
        return [document.createTextNode(str), span]
      }).reduce((a, b) => a.concat(b));

      console.log(children);

      var textParentNode = document.createElement('span');
      children.forEach((child) => {
        textParentNode.appendChild(child);
      })

      return textParentNode;
    }
    return document.createTextNode(text);
  }

  paragraph() {
    return document.createElement('p');
  }

  bold() {
    return document.createElement('strong');
  }

  italic() {
    return document.createElement('em');
  }

  underline() {
    return document.createElement('u');
  }

  link(attributes) {
    let link = document.createElement('a');
    link.setAttribute('href', attributes.uri);
    return link;
  }

  'line-break'() {
    var parentElement = document.createElement('span');
    parentElement.appendChild(document.createElement('br'));

    return parentElement;
  }

  render(editor) {
    editor.hir = new Map<Element, HIRNode>();
    let annotationGraph = new HIR(this.document);

    let placeholder = document.createElement('div');
    let children = compile(this, editor.hir, annotationGraph.rootNode.children());
    children.forEach((element: Element) => {
      placeholder.appendChild(element);
    });

    // This can be improved by doing the comparison on an element-by-element
    // basis (or by rendering incrementally via the HIR), but for now this will
    // prevent flickering of OS UI elements (e.g., spell check) while typing
    // characters that don't result in changes outside of text elements.
    if (placeholder.innerHTML != editor.innerHTML) {
      console.log('not match', placeholder.innerHTML, '\n---\n', editor.innerHTML, this.document);
      editor.innerHTML = placeholder.innerHTML;

      // We need to do a force-reset here in order to avoid waiting for a full
      // cycle of the browser event loop. The DOM has changed, but if we wait
      // for the TextSelection MutationObserver to fire, the TextSelection
      // model will have an old set of nodes (since we've just replaced them
      // with new ones).
      //
      // PERF In the event of performance issues, this is a good candidate for
      // optimization.
      if (this.selection) {
        this.querySelector('text-selection').reset();
        this.querySelector('text-selection').setSelection(this.selection);
      }
    }
  }

  renderJson(container) {
    window.requestAnimationFrame(() => {
      container.innerHTML = '';
      var counter = document.createElement('pre');
      var top = '';
      var bottom = '';
      for (var x = 0; x < 100; x++) {
        if (this.selection.start == x) {
          bottom += '<span style="background-color: blue">'
        }
        bottom += x % 10;
        if (this.selection.end == x) {
          bottom += '</span>';
        }

        if (x % 10 == 0) {
          top += x / 10;
        } else {
          top += ' ';
        }
      }
      top += '\n';
      counter.innerHTML = top + bottom;
      container.appendChild(counter);
      var rawText = document.createElement('pre');
      rawText.appendChild(document.createTextNode(this.document.content.replace(/\n/g, "¶"));
      container.appendChild(rawText);
      let table = '<table><thead><tr><th>type</th><th>start</th><th>end</th><th>display</th><th>attributes</th></tr></thead>';
      this.document.annotations.forEach((a) => {
        table += '<tr>';
        ['type', 'start', 'end', 'display'].forEach(attr => {
          table += '<td>' + a[attr] + '</td>';
        });
        if (a.attributes) {
          table += '<td>' + a.attributes.toJSON() + '</td>';
        } else {
          table += '<td></td>';
        }
        table += '</tr>';
      });
      table += '</table>';
      let tableContainer = document.createElement('div');
      tableContainer.innerHTML = table;
      container.appendChild(tableContainer);
    });
  }

  setDocument(value: Document) {
    this.document = value;
    if (this.isConnected) {
      this.scheduleRender();
    }
  }

  connectedCallback() {
    this.innerHTML = this.constructor.template;
    super.connectedCallback();
    this.scheduleRender();
  }
}
