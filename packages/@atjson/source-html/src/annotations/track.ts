// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.8.11 The track element](https://html.spec.whatwg.org/multipage/media.html#the-track-element)
export default class Track extends ObjectAnnotation<
  GlobalAttributes & {
    kind?: string;
    src?: string;
    srclang?: string;
    label?: string;
    default?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "track";
}
