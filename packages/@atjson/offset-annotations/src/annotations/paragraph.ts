import { BlockAnnotation } from "@atjson/document";

export class Paragraph<
  T = {
    decorations?: string[];
    alignment?: "start" | "center" | "end" | "justify";
  }
> extends BlockAnnotation<T> {
  static type = "paragraph";
  static vendorPrefix = "offset";

  get rank() {
    return (super.rank * 3) / 2;
  }
}
