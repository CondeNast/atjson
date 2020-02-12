export class Editor {
  static builtinPlugins: PluginCollection;
  static defaultConfig: object;
  static create(element: HTMLElement, config?: Config): Promise<Editor>;

  config: Config;
  data: DataController;
  editing: EditingController;
  isReadOnly: boolean;
  model: Model;
  state: "initializing" | "ready" | "destroyed";

  constructor(config?: Config);
  destroy(): Promise<void>;
  execute(commandName: string, ...commandParams: any[]);
}

export class PluginCollection {
  [Symbol.iterator]: Iterable<Plugin>;
}

export class Plugin {
  static pluginName: string | undefined;
}

export class DataController {
  readonly model: Model;
}

export class EditingController {}

export class Config {
  constructor(configurations?: object, defaultConfigurations?: object);
  define(name: string, value: any);
  define(name: object);
  define(name: string | object, value?: any);
  get(name: string): unknown;
  set(name: string, value: any);
  set(name: object);
  set(name: string | object, value?: any);
}

export class Model {
  document: Document;
  schema: Schema;
  markers: MarkerCollection;
}

export class Collection<T> {
  first: T | null;
  last: T | null;
  length: number;

  [Symbol.iterator]: Iterable<T>;
  add(item: T, index?: number): void;
  clear(): void;
  filter<Scope>(
    callback: (this: Scope, item: T, index: number) => boolean,
    scope?: Scope
  ): T[];
  find<Scope>(
    callback: (this: Scope, item: T, index: number) => boolean,
    scope?: Scope
  ): T;
  get(idOrIndex: string | number): T | null;
  getIndex(itemOrId: T | string): number;
  has(itemOrId: T | string): boolean;
  map<Result, Scope>(
    callback: (this: Scope, item: T, index: number) => Result,
    scope?: Scope
  ): Result[];
  remove(subject: T | string | number): T;
}

export class Document {
  readonly roots: Collection<DocumentFragment>[];
  getRoot(name: string): RootElement | null;
  getRootNames(): string[];
  toJSON(): object;
}

export class Schema {
  getDefinition(
    node: Node | TextProxy | SchemaContextItem
  ): SchemaCompiledItemDefinition;
  getDefinitions(): { [key: string]: SchemaCompiledItemDefinition };
}

export interface SchemaContextItem {
  readonly name: string;
  getAttributeKeys(): Iterable<string>;
  getAttribute(attribute: string): unknown;
}

export interface SchemaItemDefinition {
  readonly allowIn: string | string[];
  readonly allowAttributes: string | string[];
  readonly allowContentOf: string | string[];
  readonly allowWhere: string | string[];
  readonly allowAttributesOf: string | string[];
  readonly inheritTypesFrom: string | string[];
  readonly inheritAllFrom: string | string[];
}

export interface SchemaCompiledItemDefinition {
  readonly name: string;
  readonly isBlock: boolean;
  readonly isInline: boolean;
  readonly isLimit: boolean;
  readonly isObject: boolean;
  readonly isRegistered: boolean;
  readonly allowIn: string | string[];
  readonly allowAttributes: string | string[];
}

export class TextNode extends Node {
  readonly data: string;
}

export class Marker {
  affectsData: boolean;
  managedUsingOperations: boolean;
  readonly name: string;

  getEnd(): Position;
  getRange(): Range;
  getStart(): Position;
  is(type: string): boolean;
}

export class Range {
  readonly end: Position;
  readonly isCollapsed: boolean;
  readonly isFlat: boolean;
  readonly root: Element | DocumentFragment;
  readonly start: Position;

  [Symbol.iterator]: Iterable<TreeWalkerValue>;
  containsItem(item: Node | TextProxy): boolean;
  containsPosition(position: Position): boolean;
  containsRange(otherRange: Range, loose?: boolean): boolean;
  getCommonAncestor(): Element | DocumentFragment | null;
  getDifference(otherRange: Range): Range[];
  getIntersection(otherRange: Range): Range | null;
  getMinimalFlatRanges(): Range[];
  getPositions(options?: {
    boundaries?: Range;
    direction?: "backward" | "forward";
    ignoreElementEnd?: boolean;
    position?: Position;
    shallow?: boolean;
    singleCharacters?: boolean;
  }): Iterable<Position>;
  getWalker(options: {
    startPosition?: Position;
    singleCharacters?: boolean;
    shallow?: boolean;
    ignoreElementEnd?: boolean;
  }): TreeWalker;
  is(type: string): boolean;
  isEqual(otherRange: Range): boolean;
  isIntersecting(otherRange: Range): boolean;
  toJSON(): object;
}

export class Node {
  readonly document: Document | null;
  readonly endOffset: number | null;
  readonly index: number | null;
  readonly nextSibling: Node | null;
  readonly offsetSize: number;
  readonly parent: Element | DocumentFragment | null;
  readonly previousSibling: Node | null;
  readonly root: Node | DocumentFragment;
  readonly startOffset: number | null;

  getAncestors(options?: {
    includeSelf: boolean;
    parentFirst: boolean;
  }): Node[];
  getAttribute(key: string): unknown;
  getAttributeKeys(): Iterable<string>;
  getAttributes(): Iterable<unknown>;
  getCommonAncestor(
    node: Node,
    options?: { includeSelf: boolean }
  ): Element | DocumentFragment | null;
  getPath(): number[];
  hasAttribute(key: string): boolean;
  is(type: string): boolean;
  isAfter(node: Node): boolean;
  isBefore(node: Node): boolean;
  toJSON(): object;
}

export class Element extends Node {
  readonly childCount: number;
  readonly isEmpty: boolean;
  readonly maxOffset: number;
  readonly name: string;

  getChild(index: number): Node | null;
  getChildIndex(node: Node): number | null;
  getChildren(): Iterable<Node>;
  getNodeByPath(relativePath: number[]): Node | null;
  is(type: string, name?: string): boolean;
  offsetToIndex(offset: number): number;
}

export class RootElement extends Element {
  readonly document: Document | null;
  readonly rootName: string;
}

export class DocumentFragment {
  readonly childCount: number;
  readonly isEmpty: boolean;
  readonly markers: Map<string, Range>;
  readonly maxOffset: number;
  readonly parent: null;
  readonly root: this;

  [Symbol.iterator]: Iterable<Node>;
  getChild(index: number): Node | null;
  getChildIndex(node: Node): number | null;
  getChildStartOffset(node: Node): number | null;
  getChildren(): Iterable<Node>;
  getNodeByPath(relativePath: number[]): Node | null;
  is(type: string): boolean;
  offsetToIndex(offset: number): number;
  toJSON(): object;
}

export type PositionStickiness = "toNone" | "toNext" | "toPrevious";
export type PositionRelation = "before" | "after" | "same";

export class TextProxy extends TextNode {
  readonly isPartial: boolean;
  readonly offsetInText: number;
  readonly textNode: TextNode;
}

export class Position {
  readonly index: number;
  readonly isAtEnd: boolean;
  readonly isAtStart: boolean;
  readonly nodeAfter: Node | null;
  readonly nodeBefore: Node;
  offset: number;
  readonly parent: Element | DocumentFragment;
  readonly path: number[];
  readonly root: RootElement;
  stickiness: PositionStickiness;
  readonly textNode: TextNode | null;

  compareWith(otherPosition: Position): PositionRelation;
  getAncestors(): Array<Node | TextProxy>;
  getCommonAncestor(position: Position): Element | DocumentFragment | null;
  getCommonPath(position: Position): number[];
  getLastMatchingPosition(
    skip: (value: TreeWalkerValue) => boolean,
    options?: {
      boundaries?: Range;
      direction?: "backward" | "forward";
      ignoreElementEnd?: boolean;
      position?: Position;
      shallow?: boolean;
      singleCharacters?: boolean;
      startPosition?: Position;
    }
  ): Position;
  getParentPath(): number[];
  getShiftedBy(shift: number): Position;
  hasSameParentAs(position: Position): boolean;
  is(type: string): boolean;
  isAfter(otherPosition: Position): boolean;
  isBefore(otherPosition: Position): boolean;
  isEqual(otherPosition: Position): boolean;
  isTouching(otherPosition: Position): boolean;
  toJSON(): object;
}

export class TreeWalkerValue {
  item: Node | TextProxy;
  length: number;
  nextPosition: Position;
  previousPosition: Position;
  type: "elementStart" | "elementEnd" | "character" | "text";
}

export class TreeWalker {
  boundaries: Range;
  direction: "backward" | "forward";
  ignoreElementEnd: boolean;
  position: Position;
  shallow: boolean;
  singleCharacters: boolean;

  [Symbol.iterator]: Iterable<TreeWalkerValue>;
  next(): TreeWalkerValue | null;
  skip(skip: (value: TreeWalkerValue) => boolean): void;
}

export interface MarkerCollection {
  [Symbol.iterator]: Iterable<Marker>;
  get(markerName: string): Marker | null;
  getMarkersAtPosition(position: Position): Iterable<Marker>;
  getMarkersGroup(prefix: string): Iterable<Marker>;
  getMarkersIntersectingRange(range: Range): Iterable<Marker>;
  has(markerName: string): boolean;
}
