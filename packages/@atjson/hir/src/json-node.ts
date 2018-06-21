export type Node = JSONNode | string;

export default interface JSONNode {
  type: string;
  id?: number|string;
  attributes?: { [key: string]: any };
  children: Node[];
}
