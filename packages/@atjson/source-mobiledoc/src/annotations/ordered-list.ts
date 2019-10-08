import { BlockAnnotation } from "@atjson/document";

export class OrderedList extends BlockAnnotation<{
  starts?: number;
}> {
  static vendorPrefix = "mobiledoc";
  static type = "ol";
}
