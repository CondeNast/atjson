import Document from '@atjson/document';
import WebComponentRenderer from '@atjson/renderer-webcomponent';
import WebComponent from './mixins/component';

export default class HTMLTreeInspector extends WebComponent {

  static template = '<div class="wrapper"></div>';

  static events = {
    click: 'handleClick',
    change: 'render'
  };

  static style = `
    ol {
      list-style-type: none;
      font-family: Consolas, Lucida Console, Courier New, monospace;
      border-left: 1px solid #ccc;
      -webkit-padding-start: 0;
      margin: 0 0 0 6px;
    }

    .wrapper > ol {
      border-left: none;
      padding-left: 0;
    }

    li {
      padding-left: 18px;
    }

    li.collapsible {
      padding-left: 0;
    }

    li.collapsible > ol {
      padding-left: 8px;
    }

    li > .arrow::before {
      content: "\u2BC6";
    }

    li.collapsed > .arrow::before {
      content: "\u2BC8";
    }

    li .arrow {
      color: #727272;
      padding-right: 4px;
    }

    li.collapsed ol {
      display: none;
    }

    li > .ellip {
      display: none;
    }

    li.collapsed > .ellip {
      display: inline;
    }

    .html-tag {
      color: rgb(168, 148, 166);
    }

    li.collapsible > .html-tag.closing {
      padding-left: 11px;
      margin-left: 6px;
      border-left: 1px solid #ccc;
    }

    li.collapsed > .html-tag.closing {
      padding-left: 0;
      margin-left: 0;
      border-left: none;
    }

    .html-tag-name {
      color: rgb(136, 18, 128);
    }

    .html-attribute-name {
      padding-left: 1ex;
      color: rgb(153, 69, 0);
    }

    .html-attribute-value {
      color: rgb(26, 26, 166);
    }
  `;

  document: Document;

  render(event: CustomEvent) {
    if (this.deferred) return;

    this.deferred = () => {
      let doc = event.detail.document;
      let outputElement = this.shadowRoot.querySelector('.wrapper');
      let rendered = new WebComponentRenderer(doc).render();

      let children = this.renderChildren(rendered.childNodes);
      outputElement.innerHTML = '';
      outputElement.appendChild(children);

      delete this.deferred;
    };

    window.requestIdleCallback(this.deferred);

  }

  handleClick(event: MouseEvent) {
    if (event.path[0].classList.contains('arrow')) {
      event.path[1].classList.toggle('collapsed');
    }
  }

  addComponent(component) {
    WebComponentRenderer.prototype[component.annotationName] = component.elementRenderer;
  }

  private renderChildren(children) {
    let ol = document.createElement('ol');
    for (let child of children) {
      let li = document.createElement('li');

      if (child.nodeType === 3) {
        let text = document.createTextNode('"' + child.textContent.replace('\n', '\\n') + '"');
        li.appendChild(text);
        ol.appendChild(li);
        continue;
      }

      let openTag = this.genTag(child);
      let closeTag = this.genTag(child, true);

      if (child.childNodes.length === 1 && child.childNodes[0].nodeType === 3) {
        let innerText = document.createTextNode(child.childNodes[0].textContent.replace('\n', '\\n'));
        li.appendChild(openTag);
        li.appendChild(innerText);
        li.appendChild(closeTag);
      } else {
        if (child.childNodes.length > 0) this.renderArrow(li);
        li.appendChild(openTag);
        this.renderEllip(li);
        li.appendChild(this.renderChildren(child.childNodes));
        li.appendChild(closeTag);
      }
      ol.appendChild(li);
    }
    return ol;
  }

  private genAttrs(node: HTMLElement) {
    let attrs = document.createElement('span');
    attrs.classList.add('html-attributes');

    for (let attr of node.attributes) {
      if (attr.name === 'data-annotation-id') continue;

      let attrElement = document.createElement('span');
      attrElement.classList.add('html-attribute');

      let attrName = document.createElement('span');
      attrName.classList.add('html-attribute-name');
      attrName.textContent = attr.name;

      let attrValue = document.createElement('span');
      attrValue.classList.add('html-attribute-value');
      attrValue.textContent = attr.value;

      attrElement.appendChild(attrName);
      attrElement.appendChild(document.createTextNode('="'));
      attrElement.appendChild(attrValue);
      attrElement.appendChild(document.createTextNode('"'));

      attrs.appendChild(attrElement);
    }
    return attrs;
  }

  private genTag(node: HTMLElement, closing: boolean = false) {
    let tag = document.createElement('span');

    let openStr = '<';
    if (closing) openStr += '/';

    let open = document.createTextNode(openStr);
    let close = document.createTextNode('>');

    tag.classList.add('html-tag');
    if (closing) tag.classList.add('closing');

    let tagName = document.createElement('span');
    tagName.classList.add('html-tag-name');
    tagName.textContent = node.tagName.toLowerCase();

    tag.appendChild(open);
    tag.appendChild(tagName);
    if (!closing) tag.appendChild(this.genAttrs(node));

    tag.appendChild(close);

    return tag;
  }

  private renderArrow(li: HTMLLIElement) {
    li.classList.add('collapsed');
    li.classList.add('collapsible');
    let arrow = document.createElement('span');
    arrow.classList.add('arrow');
    li.appendChild(arrow);
  }

  private renderEllip(li: HTMLLIElement) {
    let ellip = document.createElement('span');
    ellip.textContent = '\u2026';
    ellip.classList.add('ellip');
    li.appendChild(ellip);
  }
}

if (!window.customElements.get('html-tree-inspector')) {
  window.customElements.define('html-tree-inspector', HTMLTreeInspector);
}
