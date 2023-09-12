import { BlockAnnotation } from "@atjson/document";

export class CneAudioEmbed extends BlockAnnotation<{
  audioType: string;
  audioId: string;
  anchorName: string;
}> {
  static vendorPrefix = "offset";
  static type = "cne-audio-embed";
}
