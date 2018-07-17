import WebComponent from '../../src/mixins/component';
import AnnotationAttribute from './annotation-attribute';

export default class AnnotationInspector extends WebComponent {

  static template = `
    <tr>
      <td class="type"></td>
      <td class="start"></td>
      <td class="end"></td>
      <td class="attributes"></td>
    </tr>
  `;

  static observedAttributes = ['type', 'start', 'end', 'attributes'];

  attributeChangedCallback(attribute) {
    switch (attribute) {
      case 'type':
        this.shadowRoot.querySelector('.type').innerHTML = this.getAttribute('type');
        break;
      case 'start':
        this.shadowRoot.querySelector('.start').innerHTML = this.getAttribute('start');
        break;
      case 'end':
        this.shadowRoot.querySelector('.end').innerHTML = this.getAttribute('end');
        break;
      case 'attributes':
        let attributes;
        try {
          attributes = JSON.parse(this.getAttribute('attributes'));
        } catch {
          this.shadowRoot.querySelector('.attributes').innerHTML = '';
          return;
        }

        let inner = [];
        this.shadowRoot.querySelector('.attributes').innerHTML = attributes.keys.map(key => {
          return `<annotation-attribute name="${key}" value="${JSON.stringify(attributes[key])}"></annotation-attribute><br/>`;
          this.shadowRoot.querySelector('.attributes');
        }).join('');

        break;
    }
  }
}
