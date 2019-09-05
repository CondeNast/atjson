// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from "@atjson/document";
import {
  Addition,
  Anchor,
  Behavior,
  ComponentAnimation,
  ComponentLayout,
  ComponentStyle,
  ComponentTextStyle,
  ConditionalText,
  InlineTextStyle
} from "../apple-news-format";

export class Heading extends BlockAnnotation<{
  role:
    | "heading"
    | "heading1"
    | "heading2"
    | "heading3"
    | "heading4"
    | "heading5"
    | "heading6";
  additions?: Addition[];
  anchor?: Anchor;
  animation?: ComponentAnimation | "none";
  behavior?: Behavior | "none";
  conditional?: ConditionalText | ConditionalText[];
  format?: "markdown" | "html" | "none";
  hidden?: boolean;
  identifier?: string;
  inlineTextStyles?: InlineTextStyle[] | "none";
  layout?: ComponentLayout | string;
  style?: ComponentStyle | string | "none";
  textStyle?: ComponentTextStyle | string;
}> {
  static vendorPrefix = "apple-news";
  static type = "Heading";
}
