// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.2.4 The link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element)
export default class Link extends ObjectAnnotation<
  GlobalAttributes & {
    href?: string;
    crossorigin?: string;
    rel?: string;
    media?: string;
    integrity?: string;
    hreflang?: string;
    type?: string;
    referrerpolicy?: string;
    sizes?: string;
    imagesrcset?: string;
    imagesizes?: string;
    as?: string;
    color?: string;
    title?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "link";
}
