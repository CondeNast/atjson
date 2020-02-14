import { Annotation } from "@atjson/document";

export class HTML extends Annotation<{
  style: "inline" | "block";
}> {
  static vendorPrefix = "offset";
  static type = "html";

  get rank() {
    if (this.attributes.style === "inline") {
      return 100;
    }
    return 10;
  }
}
