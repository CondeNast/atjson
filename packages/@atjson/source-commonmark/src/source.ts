import Document from "@atjson/document";
import MarkdownIt from "markdown-it";
import {
  Blockquote,
  BulletList,
  CodeBlock,
  CodeInline,
  Emphasis,
  Fence,
  HTMLBlock,
  HTMLInline,
  Hardbreak,
  Heading,
  HorizontalRule,
  Image,
  Link,
  ListItem,
  OrderedList,
  Paragraph,
  Strong,
  Table,
  TableBodyCell,
  TableBodySection,
  TableHeadCell,
  TableHeadSection,
  TableRow,
} from "./annotations";
import Parser from "./parser";

export default class CommonMarkSource extends Document {
  static contentType = "application/vnd.atjson+commonmark";
  static schema = [
    Blockquote,
    BulletList,
    CodeBlock,
    CodeInline,
    Emphasis,
    Fence,
    Hardbreak,
    Heading,
    HorizontalRule,
    HTMLBlock,
    HTMLInline,
    Image,
    Link,
    ListItem,
    OrderedList,
    Paragraph,
    Strong,
    Table,
    TableBodyCell,
    TableBodySection,
    TableHeadCell,
    TableHeadSection,
    TableRow,
  ];

  static fromRaw(markdown: string) {
    let md = this.markdownParser;
    let parser = new Parser(md.parse(markdown, {}), this.contentHandlers);

    return new this({
      content: parser.content,
      annotations: parser.annotations,
    });
  }

  static get markdownParser() {
    return new MarkdownIt("commonmark", { linkify: false });
  }

  static get contentHandlers() {
    return {};
  }
}
