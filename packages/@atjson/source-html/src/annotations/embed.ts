// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ 4.8.6 The embed element](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#the-embed-element)
export class Embed extends ObjectAnnotation<
  GlobalAttributes & {
    src?: string;
    type?: string;
    width?: string;
    height?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "embed";
}
