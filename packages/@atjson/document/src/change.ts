export abstract class Change {
  abstract readonly type: string;
}

export enum EdgeBehaviour {
  preserve,
  modify,
}

/**
 * the "public" API for behaviour
 */
export enum AdjacentBoundaryBehaviour {
  /**
   * alias for modify / preserveLeading
   */
  default,

  /**
   * @deprecated use preserveLeading
   */
  modify,
  preserveLeading,

  /**
   * @deprecated use preserveBoth
   */
  preserve,
  preserveBoth,
  preserveTrailing,
}

export class Deletion extends Change {
  readonly type = "deletion";
  constructor(
    readonly start: number,
    readonly end: number,
    readonly behaviourLeading: EdgeBehaviour = EdgeBehaviour.preserve,
    readonly behaviourTrailing: EdgeBehaviour = EdgeBehaviour.modify,
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
    readonly behaviourTrailing: EdgeBehaviour = EdgeBehaviour.modify,
  ) {
    super();
  }
}
