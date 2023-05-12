// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

export class FireworkEmbed extends ObjectAnnotation<
  GlobalAttributes & {
    id: string;
    channel?: string;
    open_in?: "default" | "_self" | "_modal" | "_blank";
    playlist?: string;
    mode?: string;
    max_videos?: string;
    placement?: string;
    player_placement?: string;
    pip?: boolean;
    player_minimize?: boolean;
    branding?: boolean;
  }
> {
  static vendorPrefix = "html";
  static type = "fw-embed-feed";
}