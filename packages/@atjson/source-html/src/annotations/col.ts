// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.9.4 The col element](https://html.spec.whatwg.org/multipage/tables.html#the-col-element)
export default class Column extends ObjectAnnotation<
  GlobalAttributes & {
    span?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "col";
}
