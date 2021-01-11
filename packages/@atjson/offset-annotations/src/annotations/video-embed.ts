import { ObjectAnnotation } from "@atjson/document";
import { CaptionSource } from "./caption-source";
import { getClosestAspectRatio, VideoURLs } from "../utils";

export class VideoEmbed extends ObjectAnnotation<{
  /**
   * The embed URL of the video
   */
  url: string;
  /**
   * The provider of the Video
   */
  provider: VideoURLs.Provider;
  /**
   * A normalized aspect ratio of the video, constrained to
   * a list of aspect ratios
   */
  aspectRatio?: ReturnType<typeof getClosestAspectRatio>;
  /**
   * The natural width of the video, as returned by an
   * oEmbed endpoint.
   * @deprecated
   */
  width?: number;
  /**
   * The natural height of the video, as returned by an
   * oEmbed endpoint.
   * @deprecated
   */
  height?: number;
  caption?: CaptionSource;
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "video-embed";
  static vendorPrefix = "offset";
  static subdocuments = { caption: CaptionSource };
}
