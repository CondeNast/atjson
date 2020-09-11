import { BlockAnnotation } from "@atjson/document";

export class Heading extends BlockAnnotation<{
  level: 1 | 2 | 3 | 4 | 5 | 6;
  alignment?: "start" | "center" | "end" | "justify";
}> {
  static type = "heading";
  static vendorPrefix = "offset";
}
