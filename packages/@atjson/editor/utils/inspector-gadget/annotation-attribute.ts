import WebComponent from '../../src/mixins/component';

export default class AnnotationAttribute extends WebComponent {
  static template = '<span class="name"></span> = <span class="value"></span>'

  static observedAttributes = ['name', 'value'];

  attributeChangedCallback(attribute) {
    switch (attribute) {
      case 'name':
        this.shadowRoot.querySelector('.name').innerHTML = this.getAttribute('name');
        break;
      case 'value':
        this.shadowRoot.querySelector('.value').innerHTML = this.getAttribute('value');
        break;
    }
  }
}
