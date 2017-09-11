export default interface Annotation {
  type: string;
  start: number;
  end: number;

  transform?: (
    annotation: Annotation,
    content: string,
    position: number,
    length: number,
    preserveAdjacentBoundaries: boolean) => void;
}
