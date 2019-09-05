// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.9.9 The td element](https://html.spec.whatwg.org/multipage/tables.html#the-td-element)
export default class TableData extends BlockAnnotation<
  GlobalAttributes & {
    colspan?: string;
    rowspan?: string;
    headers?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "td";
}
