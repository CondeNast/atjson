import { BlockAnnotation } from "@atjson/document";

export class OrderedList extends BlockAnnotation<{
  starts: string;
}> {
  static vendorPrefix = "mobiledoc";
  static type = "ol";
}
