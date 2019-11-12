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
  IframeEmbed,
  Image,
  Indent,
  InstagramEmbed,
  Italic,
  LineBreak,
  Link,
  List,
  ListItem,
  Paragraph,
  PinterestEmbed,
  Pullquote,
  Section,
  SmallCaps,
  Strikethrough,
  Subscript,
  Superscript,
  TwitterEmbed,
  Underline,
  YouTubeEmbed
} from "./annotations";

export * from "./annotations";
export * from "./utils";

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
    IframeEmbed,
    Image,
    Indent,
    InstagramEmbed,
    Italic,
    LineBreak,
    Link,
    List,
    ListItem,
    Paragraph,
    PinterestEmbed,
    Pullquote,
    Section,
    SmallCaps,
    Strikethrough,
    Subscript,
    Superscript,
    TwitterEmbed,
    Underline,
    YouTubeEmbed
  ];
}
