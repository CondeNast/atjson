// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import {
  Anchor,
  Behavior,
  ComponentAnimation,
  ComponentLayout,
  ComponentStyle,
  ConditionalComponent,
  MapSpan
} from "../apple-news-format";

export class Place extends ObjectAnnotation<{
  latitude: number;
  longitude: number;
  role: "place";
  accessibilityCaption?: string;
  anchor?: Anchor;
  animation?: ComponentAnimation | "none";
  behavior?: Behavior | "none";
  caption?: string;
  conditional?: ConditionalComponent | ConditionalComponent[];
  hidden?: boolean;
  identifier?: string;
  layout?: ComponentLayout | string;
  mapType?: "standard" | "hybrid" | "satellite";
  span?: MapSpan;
  style?: ComponentStyle | string | "none";
}> {
  static vendorPrefix = "apple-news";
  static type = "Place";
}
