import { BlockAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

export class Accordion extends BlockAnnotation<GlobalAttributes> {
  static type = "accordion";
  static vendorPrefix = "offset";
}
