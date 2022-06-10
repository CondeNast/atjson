import { BlockAnnotation } from "@atjson/document";

export class CodeBlock extends BlockAnnotation<{
  info?: string;
}> {
  static vendorPrefix = "offset";
  static type = "code-block";
}
