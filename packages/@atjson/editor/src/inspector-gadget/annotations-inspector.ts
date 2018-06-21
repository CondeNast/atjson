import AnnotationInspector from './annotation-attribute';
import WebComponent from '../mixins/component';

if (!window.customElements.get('annotation-attribute')) {
  window.customElements.define('annotation-attribute', AnnotationInspector);
}

export default class AnnotationsInspector extends WebComponent {
  static template = `
    <div class="container">
    <table>
      <colgroup>
        <col class="annotation-type"/>
        <col class="annotation-start"/>
        <col class="annotation-end"/>
        <col class="annotation-attributes"/>
      </colgroup>
      <thead>
        <tr>
          <th>Type</th>
          <th>Start</th>
          <th>End</th>
          <th>Attributes</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    </div>
  `;
  static style = `
    .container {
      overflow-y: scroll;
      position: relative;
      padding-bottom: 2em;
    }

    table {
      border-collapse: collapse;
      width: 100vw;
    }

    th {
      font-size: 0.75em;
      font-family: sans-serif;
      border-bottom: 1px solid black;
      border-top: 1px solid black;
      text-align: left;
    }

    td {
      font-family: monospace;
      vertical-align: top;
      border-bottom: 0.5px solid grey;
    }

    th, td {
      padding: 1ex 0;
    }

    td:first-child, th:first-child {
      padding-left: 1ex;
    }

    .annotation-type {
      width: 10vw;
    }

    .annotation-start, .annotation-end {
      width: 4em;
    }
  `;

  updateTBody() {
    let tbody = '';
    this.document.annotations.forEach((a) => {
      tbody += `<tr><td>${a.type}</td><td>${a.start}</td><td>${a.end}</td><td>`;
      if (a.attributes) {
        Object.keys(a.attributes).forEach(key => {
          tbody += `<annotation-attribute name='${key}' value='${a.attributes[key]}'></annotation-attribute><br/>`
        });
      } else {
      tbody += `</td></tr>`
    });
    this.shadowRoot.querySelector('tbody').innerHTML = tbody;
  }

  setDocument(doc) {
    this.document = doc;
    this.document.addEventListener('change', _ => window.requestAnimationFrame(_ => this.updateTBody()));
  }
}
