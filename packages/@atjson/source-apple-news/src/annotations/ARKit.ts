// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import {
  Anchor,
  Behavior,
  ComponentAnimation,
  ComponentLayout,
  ComponentStyle,
  ConditionalComponent
} from "../apple-news-format";

export class ARKit extends ObjectAnnotation<{
  caption: string;
  role: "arkit";
  URL: string;
  accessibilityCaption?: string;
  anchor?: Anchor;
  animation?: ComponentAnimation | "none";
  behavior?: Behavior | "none";
  conditional?: ConditionalComponent | ConditionalComponent[];
  explicitContent?: boolean;
  hidden?: boolean;
  identifier?: string;
  layout?: ComponentLayout | string;
  style?: ComponentStyle | string | "none";
}> {
  static vendorPrefix = "apple-news";
  static type = "ARKit";
}
