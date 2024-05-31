import Document from "@atjson/document";
import {
  Accordion,
  AccordionGroup,
  Blockquote,
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
    Blockquote,
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
    Paragraph,
    PinterestEmbed,
    Pullquote,
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
    Accordion,
    AccordionGroup,
  ];
}
