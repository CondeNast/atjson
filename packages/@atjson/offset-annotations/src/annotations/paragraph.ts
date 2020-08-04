import { BlockAnnotation } from "@atjson/document";

export class Paragraph<
  T = {
    decorations?: string[];
  }
> extends BlockAnnotation<T> {
  static type = "paragraph";
  static vendorPrefix = "offset";

  get rank() {
    return (super.rank * 3) / 2;
  }
}
