export default interface Annotation {
  type: string;
  start: number;
  end: number;

  attributes?: { [key: string]: any };

  transform?: (
    annotation: Annotation,
    content: string,
    position: number,
    length: number,
    preserveAdjacentBoundaries: boolean) => void;
}
