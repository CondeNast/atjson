/// <amd-module name="@atjson/hir/json-node"/>
export type node = JSONNode|string;

export default interface JSONNode {
  type: string;
  attributes?: { [key: string]: any };
  children: node[];
}
