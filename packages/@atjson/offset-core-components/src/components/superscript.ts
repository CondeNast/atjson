import EditableComponent from '../mixins/editable-component';

export default class OffsetSuperscriptElement extends EditableComponent {

  static annotationName = 'superscript';

  static elementRenderer = (): Element => {
    return document.createElement('sup');
  }
}
