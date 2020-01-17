export abstract class Change {
  abstract readonly type: string;
}

export enum AdjacentBoundaryBehaviour {
  preserve,
  default,
  modify
}

export class Deletion extends Change {
  readonly type = "deletion";
  constructor(
    readonly start: number,
    readonly end: number,
    readonly behaviour: AdjacentBoundaryBehaviour = AdjacentBoundaryBehaviour.default
  ) {
    super();
  }
}

export class Insertion extends Change {
  readonly type = "insertion";
  constructor(
    readonly start: number,
    readonly text: string,
    readonly behaviour: AdjacentBoundaryBehaviour = AdjacentBoundaryBehaviour.default
  ) {
    super();
  }
}
