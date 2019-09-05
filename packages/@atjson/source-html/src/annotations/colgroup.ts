// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.9.3 The colgroup element](https://html.spec.whatwg.org/multipage/tables.html#the-colgroup-element)
export default class ColumnGroup extends ObjectAnnotation<
  GlobalAttributes & {
    span?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "colgroup";
}
