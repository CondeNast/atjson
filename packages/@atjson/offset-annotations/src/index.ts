import Document from "@atjson/document";
import {
  Blockquote,
  Bold,
  Code,
  FacebookEmbed,
  GiphyEmbed,
  HTML,
  Heading,
  HorizontalRule,
  Image,
  InstagramEmbed,
  Italic,
  LineBreak,
  Link,
  List,
  ListItem,
  Paragraph,
  PinterestEmbed,
  Pullquote,
  Strikethrough,
  Subscript,
  Superscript,
  TwitterEmbed,
  Underline,
  YouTubeEmbed
} from "./annotations";
export { default as CaptionSource } from "./annotations/caption-source";

export * from "./annotations";

export default class OffsetSource extends Document {
  static contentType = "application/vnd.atjson+offset";
  static schema = [
    Blockquote,
    Bold,
    Code,
    FacebookEmbed,
    GiphyEmbed,
    Heading,
    HorizontalRule,
    HTML,
    Image,
    InstagramEmbed,
    Italic,
    LineBreak,
    Link,
    List,
    ListItem,
    Paragraph,
    PinterestEmbed,
    Pullquote,
    Strikethrough,
    Subscript,
    Superscript,
    TwitterEmbed,
    Underline,
    YouTubeEmbed
  ];
}
