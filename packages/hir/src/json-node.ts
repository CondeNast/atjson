export default interface JSONNode {
  type: string;
  attributes?: { [key: string]: any };
  children: (JSONNode|string)[];
}
