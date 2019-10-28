// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ 4.12.5 The canvas element](https://html.spec.whatwg.org/multipage/canvas.html#the-canvas-element)
export class Canvas extends InlineAnnotation<
  GlobalAttributes & {
    width?: string;
    height?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "canvas";
}
