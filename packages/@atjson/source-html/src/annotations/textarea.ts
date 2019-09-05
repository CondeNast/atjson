// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.10.11 The textarea element](https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element)
export default class Textarea extends BlockAnnotation<
  GlobalAttributes & {
    autocomplete?: string;
    autofocus?: string;
    cols?: string;
    dirname?: string;
    disabled?: string;
    form?: string;
    maxlength?: string;
    minlength?: string;
    name?: string;
    placeholder?: string;
    readonly?: string;
    required?: string;
    rows?: string;
    wrap?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "textarea";
}
