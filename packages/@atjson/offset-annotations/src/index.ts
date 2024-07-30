import Document from "@atjson/document";
import {
  Accordion,
  Blockquote,
  BlueskyEmbed,
  Bold,
  CerosEmbed,
  CneAudioEmbed,
  CneEventRegistrationEmbed,
  Code,
  CodeBlock,
  DataSet,
  FacebookEmbed,
  FireworkEmbed,
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
  MastodonEmbed,
  Paragraph,
  PinterestEmbed,
  Pullquote,
  RedditEmbed,
  Section,
  Sidebar,
  SmallCaps,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  ThreadsEmbed,
  TikTokEmbed,
  TwitterEmbed,
  Underline,
  VideoEmbed,
} from "./annotations";

export * from "./annotations";
export * from "./utils";

export default class OffsetSource extends Document {
  static contentType = "application/vnd.atjson+offset";
  static schema = [
    Accordion,
    Blockquote,
    BlueskyEmbed,
    Bold,
    CerosEmbed,
    CneAudioEmbed,
    CneEventRegistrationEmbed,
    Code,
    CodeBlock,
    DataSet,
    FacebookEmbed,
    FireworkEmbed,
    FixedIndent,
    GiphyEmbed,
    GroupItem,
    Group,
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
    MastodonEmbed,
    Paragraph,
    PinterestEmbed,
    Pullquote,
    RedditEmbed,
    Section,
    Sidebar,
    SmallCaps,
    Strikethrough,
    Subscript,
    Superscript,
    Table,
    ThreadsEmbed,
    TikTokEmbed,
    TwitterEmbed,
    Underline,
    VideoEmbed,
  ];
}
