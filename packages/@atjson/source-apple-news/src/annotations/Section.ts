// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from "@atjson/document";
import {
  Anchor,
  Behavior,
  CollectionDisplay,
  ComponentAnimation,
  ComponentLayout,
  ComponentLink,
  ComponentStyle,
  ConditionalSection,
  HorizontalStackDisplay,
  Scene
} from "../apple-news-format";

export class Section extends BlockAnnotation<{
  role: "section";
  additions?: ComponentLink[];
  anchor?: Anchor;
  animation?: ComponentAnimation | "none";
  behavior?: Behavior | "none";
  conditional?: ConditionalSection | ConditionalSection[];
  contentDisplay?: CollectionDisplay | HorizontalStackDisplay | "none";
  hidden?: boolean;
  identifier?: string;
  layout?: ComponentLayout | string;
  scene?: Scene;
  style?: ComponentStyle | string | "none";
}> {
  static vendorPrefix = "apple-news";
  static type = "Section";
}
