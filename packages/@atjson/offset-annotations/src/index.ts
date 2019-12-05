import Document from "@atjson/document";
import {
  Blockquote,
  Bold,
  Code,
  FacebookEmbed,
  FixedIndent,
  GiphyEmbed,
  Group,
  GroupItem,
  HTML,
  Heading,
  HorizontalRule,
  IframeEmbed,
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
    FixedIndent,
    GiphyEmbed,
    Group,
    GroupItem,
    Heading,
    HorizontalRule,
    HTML,
    IframeEmbed,
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
