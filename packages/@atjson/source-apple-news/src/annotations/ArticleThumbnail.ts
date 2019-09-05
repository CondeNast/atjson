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

export class ArticleThumbnail extends ObjectAnnotation<{
  role: "article_thumbnail";
  accessibilityCaption?: string;
  additions?: ComponentLink[];
  anchor?: Anchor;
  animation?: ComponentAnimation | "none";
  aspectRatio?: number;
  behavior?: Behavior | "none";
  caption?: CaptionDescriptor | string;
  conditional?: ConditionalComponent | ConditionalComponent[];
  explicitContent?: boolean;
  fillMode?: "cover" | "fit";
  hidden?: boolean;
  horizontalAlignment?: "left" | "center" | "right";
  identifier?: string;
  layout?: ComponentLayout | string;
  style?: ComponentStyle | string | "none";
  URL?: string;
  verticalAlignment?: "top" | "center" | "bottom";
}> {
  static vendorPrefix = "apple-news";
  static type = "ArticleThumbnail";
}
