export abstract class Change {
  abstract readonly type: string;
}

export enum EdgeBehaviour {
  preserve,
  modify
}

// the "public" API for behaviour
export enum AdjacentBoundaryBehaviour {
  // default is an alias for modify / preserveLeading
  // modify and preserve are targeted for deprecation
  default,
  modify,
  preserveLeading,
  preserve,
  preserveTrailing,
  preserveBoth
}

export class Deletion extends Change {
  readonly type = "deletion";
  constructor(
    readonly start: number,
    readonly end: number,
    readonly behaviourLeading: EdgeBehaviour = EdgeBehaviour.preserve,
    readonly behaviourTrailing: EdgeBehaviour = EdgeBehaviour.modify
  ) {
    super();
  }
}

export class Insertion extends Change {
  readonly type = "insertion";
  constructor(
    readonly start: number,
    readonly text: string,
    readonly behaviourLeading: EdgeBehaviour = EdgeBehaviour.preserve,
    readonly behaviourTrailing: EdgeBehaviour = EdgeBehaviour.modify
  ) {
    super();
  }
}
