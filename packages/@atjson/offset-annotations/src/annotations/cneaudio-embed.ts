import { BlockAnnotation } from "@atjson/document";

export class CneAudioEmbed extends BlockAnnotation<{
  url: string;
  anchorName: string;
}> {
  static vendorPrefix = "offset";
  static type = "cneaudio-embed";
}
