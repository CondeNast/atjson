import { ObjectAnnotation } from "@atjson/document";
import { CaptionSource } from "./caption-source";

export class VideoEmbed extends ObjectAnnotation<{
  url: string;
  /**
   * A normalized aspect ratio of the video, constrained to
   * a list of aspect ratios
   */
  aspectRatio?:
    | ReturnType<>
    | "1:1" // Square
    | "4:3" // iPad
    | "16:9" // Widescreen
    | "9:16"; // Vertical Video ✌️
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
}> {
  static type = "video-embed";
  static vendorPrefix = "offset";
  static subdocuments = { caption: CaptionSource };
}
