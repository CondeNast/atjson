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

export class HTMLTable extends ObjectAnnotation<{
  html: string;
  role: "htmltable";
  anchor?: Anchor;
  animation?: ComponentAnimation | "none";
  behavior?: Behavior | "none";
  conditional?: ConditionalComponent | ConditionalComponent[];
  hidden?: boolean;
  identifier?: string;
  layout?: ComponentLayout | string;
  style?: ComponentStyle | string | "none";
}> {
  static vendorPrefix = "apple-news";
  static type = "HTMLTable";
}
