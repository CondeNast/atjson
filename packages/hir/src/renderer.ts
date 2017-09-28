import Renderer from '@atjson/renderer';

interface Annotation {
  type: string;
  attributes: Object;
  children: (Annotation|string)[]
}

interface Transform {
  (annotation: Annotation|string): Annotation|string;
}

interface TransformList {
  [key: string]: {
    type: string;
    transform: Transform;
  }
};

/**
  import { Renderer } from '@atjson/hir';
  let renderer = new Renderer();
  renderer.transform('list-item', (annotation) => {
    if (annotation.children.length === 1 &&
        annotation.children[0].type === 'paragraph') {
      return annotation.children[0];
    }
    return annotation;
  });
 */
export default class extends Renderer {
  private transforms: TransformList;

  constructor () {
    super();
    this.transforms = [];
  }

  transform (type: string, transform: Transform) {
    this.transforms.push({ type, transform });
    return this;
  }

  *renderAnnotation (annotation) {
    let transforms = this.transforms.transform(({ type }) => annotation.type === type);
    let transformedAnnotation = transforms.reduce(function (transformedAnnotation, transform) {
      return transform(transformedAnnotation);
    }, annotation);
    transformeredAnnotation.children = yield;
    return transformedAnnotation;
  }
}
