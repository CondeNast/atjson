// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.8.10 The audio element](https://html.spec.whatwg.org/multipage/media.html#the-audio-element)
export default class Audio extends BlockAnnotation<
  GlobalAttributes & {
    src?: string;
    crossorigin?: string;
    preload?: string;
    autoplay?: string;
    loop?: string;
    muted?: string;
    controls?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "audio";
}
