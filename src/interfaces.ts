export interface Annotation {
  type: string;
  start: number;
  end: number;
}

export interface AtJSON {
  content: string;
  contentType?: string;
  annotations: Array<Annotation>;
}

export interface HIRNode {
  type: string;
  children: Array<HIRNode|string>;
}
