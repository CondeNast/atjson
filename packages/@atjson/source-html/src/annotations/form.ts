// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ 4.10.3 The form element](https://html.spec.whatwg.org/multipage/forms.html#the-form-element)
export class Form extends BlockAnnotation<
  GlobalAttributes & {
    "accept-charset"?: string;
    action?: string;
    autocomplete?: string;
    enctype?: string;
    method?: string;
    name?: string;
    novalidate?: string;
    target?: string;
    rel?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "form";
}
