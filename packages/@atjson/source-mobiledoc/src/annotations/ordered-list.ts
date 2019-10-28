import { BlockAnnotation } from "@atjson/document";

export default class OrderedList extends BlockAnnotation<{
  starts: string;
}> {
  static vendorPrefix = "mobiledoc";
  static type = "ol";
}
