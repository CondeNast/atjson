// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ 4.4.5 The ol element](https://html.spec.whatwg.org/multipage/grouping-content.html#the-ol-element)
export class OrderedList extends BlockAnnotation<
  GlobalAttributes & {
    reversed?: string;
    start?: string;
    type?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "ol";
}
