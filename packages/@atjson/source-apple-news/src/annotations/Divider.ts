// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import {
  Anchor,
  Behavior,
  ComponentAnimation,
  ComponentLayout,
  ComponentStyle,
  ConditionalDivider,
  StrokeStyle
} from "../apple-news-format";

export class Divider extends ObjectAnnotation<{
  role: "divider";
  anchor?: Anchor;
  animation?: ComponentAnimation | "none";
  behavior?: Behavior | "none";
  conditional?: ConditionalDivider | ConditionalDivider[];
  hidden?: boolean;
  identifier?: string;
  layout?: ComponentLayout | string;
  stroke?: StrokeStyle | "none";
  style?: ComponentStyle | string | "none";
}> {
  static vendorPrefix = "apple-news";
  static type = "Divider";
}
