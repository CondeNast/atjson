// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ 4.4.1 The p element](https://html.spec.whatwg.org/multipage/grouping-content.html#the-p-element)
export class Paragraph extends BlockAnnotation<GlobalAttributes> {
  static vendorPrefix = "html";
  static type = "p";

  get rank() {
    return 15;
  }
}
