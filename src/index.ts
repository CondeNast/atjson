import { Annotation, AtJSON, HIRNode } from './interfaces';
export { Annotation, AtJSON, HIRNode };

export class HIR {
  atjson: AtJSON;

  constructor (atjson: string | AtJSON) {
    if (atjson instanceof String) {
    } else {
      this.atjson = atjson;
    }
  }

  toJSON(): HIRNode {
    return <HIRNode>{
      type: 'root',
      children: []
    };
  }
}
