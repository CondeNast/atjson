import { BlockAnnotation } from "@atjson/document";

export default class UnorderedList extends BlockAnnotation {
  static vendorPrefix = "mobiledoc";
  static type = "ul";
}
