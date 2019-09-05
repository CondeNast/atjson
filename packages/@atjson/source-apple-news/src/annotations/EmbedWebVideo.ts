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

export class EmbedWebVideo extends ObjectAnnotation<{
  role: "embedwebvideo" | "embedvideo";
  URL: string;
  accessibilityCaption?: string;
  anchor?: Anchor;
  animation?: ComponentAnimation | "none";
  aspectRatio?: number;
  behavior?: Behavior | "none";
  caption?: string;
  conditional?: ConditionalComponent | ConditionalComponent[];
  explicitContent?: boolean;
  hidden?: boolean;
  identifier?: string;
  layout?: ComponentLayout | string;
  style?: ComponentStyle | string | "none";
}> {
  static vendorPrefix = "apple-news";
  static type = "EmbedWebVideo";
}
