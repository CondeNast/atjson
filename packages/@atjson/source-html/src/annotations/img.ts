// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.8.3 The img element](https://html.spec.whatwg.org/multipage/embedded-content.html#the-img-element)
export default class Image extends ObjectAnnotation<
  GlobalAttributes & {
    alt?: string;
    src?: string;
    srcset?: string;
    sizes?: string;
    crossorigin?: string;
    usemap?: string;
    ismap?: string;
    width?: string;
    height?: string;
    referrerpolicy?: string;
    decoding?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "img";
}
