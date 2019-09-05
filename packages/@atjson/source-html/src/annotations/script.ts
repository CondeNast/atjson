// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.12.1 The script element](https://html.spec.whatwg.org/multipage/scripting.html#the-script-element)
export default class Script extends BlockAnnotation<
  GlobalAttributes & {
    src?: string;
    type?: string;
    nomodule?: string;
    async?: string;
    defer?: string;
    crossorigin?: string;
    integrity?: string;
    referrerpolicy?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "script";
}
