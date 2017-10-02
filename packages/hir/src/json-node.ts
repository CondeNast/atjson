type node = JSONNode|string;

export default interface JSONNode {
  type: string;
  attributes?: { [key: string]: any };
  children: node[];
}
