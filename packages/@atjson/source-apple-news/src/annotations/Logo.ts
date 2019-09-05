// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import {
  Anchor,
  Behavior,
  CaptionDescriptor,
  ComponentAnimation,
  ComponentLayout,
  ComponentLink,
  ComponentStyle,
  ConditionalComponent
} from "../apple-news-format";

export class Logo extends ObjectAnnotation<{
  role: "logo";
  URL: string;
  accessibilityCaption?: string;
  additions?: ComponentLink[];
  anchor?: Anchor;
  animation?: ComponentAnimation | "none";
  behavior?: Behavior | "none";
  caption?: CaptionDescriptor | string;
  conditional?: ConditionalComponent | ConditionalComponent[];
  explicitContent?: boolean;
  hidden?: boolean;
  identifier?: string;
  layout?: ComponentLayout | string;
  style?: ComponentStyle | string | "none";
}> {
  static vendorPrefix = "apple-news";
  static type = "Logo";
}
