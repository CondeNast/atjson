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

export class BannerAdvertisement extends ObjectAnnotation<{
  role: "banner_advertisement";
  anchor?: Anchor;
  animation?: ComponentAnimation | "none";
  bannerType?: "any" | "standard" | "double_height" | "large";
  behavior?: Behavior | "none";
  conditional?: ConditionalComponent | ConditionalComponent[];
  hidden?: boolean;
  identifier?: string;
  layout?: ComponentLayout | string;
  style?: ComponentStyle | string | "none";
}> {
  static vendorPrefix = "apple-news";
  static type = "BannerAdvertisement";
}
