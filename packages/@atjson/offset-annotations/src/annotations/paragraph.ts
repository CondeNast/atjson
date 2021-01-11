import { BlockAnnotation } from "@atjson/document";

export class Paragraph<
  T = {
    decorations?: string[];
    alignment?: "start" | "center" | "end" | "justify";
    /**
     * A named identifier used to quickly jump to this item
     */
    anchorName?: string;
  }
> extends BlockAnnotation<T> {
  static type = "paragraph";
  static vendorPrefix = "offset";

  get rank() {
    return (super.rank * 3) / 2;
  }
}
