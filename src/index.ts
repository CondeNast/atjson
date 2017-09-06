export interface AtJSON {
  content: string;
  contentType: string | void;
  annotations: Array<Annotation | never>;
}

export interface Annotation {
  type: string;
  start: number;
  end: number;
}

export class HIR {
  atjson: AtJSON;

  constructor (atjson: string | AtJSON) {
    if (atjson instanceof String) {
    } else {
      this.atjson = atjson;
    }
  }

  toJSON(): object {
    return [];
  }
}
