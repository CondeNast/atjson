import Document from '@atjson/document';
import events from './mixins/events';

export default class InspectorGadget extends events(HTMLElement) {

  document: Document;

  render() {
    this.innerHTML = '';
    var counter = document.createElement('pre');
    var top = '';
    var bottom = '';
    console.table({start: this.selection.start, end: this.selection.end});
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
    this.appendChild(counter);
    var rawText = document.createElement('pre');
    rawText.appendChild(document.createTextNode(this.document.content.replace(/\n/g, "¶")));
    this.appendChild(rawText);
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
    this.appendChild(tableContainer);
  }

  setDocument(doc) {
    this.document = doc;
    this.document.addEventListener('change', (_ => {
      window.requestAnimationFrame(_ => this.render());
    }));
  }

  setSelection(el) {
    el.addEventListener('change', evt => {
      this.selection = evt.detail;
      window.requestAnimationFrame(_ => this.render());
    });
  }

  connectedCallback() {
    this.innerHTML = this.constructor.template;
    super.connectedCallback();
  }
}
