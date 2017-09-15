import Renderer from 'atjson-renderer';

interface Filter {
  (annotation: Annotation|string): Annotation|string;
}

interface FilterList {
  type: string;
  filter: Filter;
}[];

/**
  import { Renderer } from 'atjson-hir';
  let renderer = new Renderer();
  renderer.filter('list-item', (annotation) => {
    if (annotation.children.length === 1 &&
        annotation.children[0].type === 'paragraph') {
      return annotation.children[0];
    }
    return annotation;
  });

  let hir = renderer.render();
 */
export default class extends Renderer {
  private filters: FilterList;

  constructor () {
    super();
    this.filters = [];
  }

  filter (type: string, filter: Filter) {
    this.filters.push({ type, filter });
    return this;
  }

  *renderAnnotation (annotation) {
    let filters = this.filters.filter(({ type }) => annotation.type === type);
    let filteredAnnotation = filters.reduce(function (filteredAnnotation, filter) {
      return filter(filteredAnnotation);
    }, annotation);
    filtereredAnnotation.children = yield;
    return filteredAnnotation;
  }
}
