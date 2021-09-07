import { IframeEmbed } from "./iframe-embed";

export class TelegramEmbed extends IframeEmbed {
  static type = "telegram-embed";
  static vendorPrefix = "offset";
}
