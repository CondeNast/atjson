// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ 4.8.14 The area element](https://html.spec.whatwg.org/multipage/image-maps.html#the-area-element)
export class Area extends ObjectAnnotation<
  GlobalAttributes & {
    alt?: string;
    coords?: string;
    shape?: string;
    href?: string;
    target?: string;
    download?: string;
    rel?: string;
    referrerpolicy?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "area";
}
