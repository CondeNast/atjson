import Document, { Annotation } from "@atjson/document";
import { List } from "@atjson/offset-annotations";
import Renderer from "@atjson/renderer-hir";

export default class PlainTextRenderer extends Renderer {
  constructor(document: Document, ...args: any[]) {
    document
      .where(
        (annotation: Annotation) =>
          // explicitly removing annotations we don't support here
          annotation.type !== "parse-token" &&
          annotation.type !== "line-break" &&
          annotation.type !== "list-item" &&
          annotation.type !== "code-inline" &&
          annotation.type !== "list" &&
          annotation.type !== "paragraph" &&
          annotation.type !== "heading" &&
          annotation.type !== "pullquote" &&
          annotation.type !== "blockquote"
      )
      .remove();
    super(document, args);
  }

  *root(): Iterator<void, string, string[]> {
    let text = yield;
    return text.join("");
  }

  *LineBreak() {
    return "\n";
  }

  *Heading(): Iterator<void, string, string[]> {
    let item = yield;
    return item.join("") + "\n\n";
  }

  *Blockquote(): Iterator<void, string, string[]> {
    let item = yield;
    return item.join("") + "\n\n";
  }

  *Pullquote(): Iterator<void, string, string[]> {
    let item = yield;
    return item.join("") + "\n\n";
  }

  *ListItem(): Iterator<void, string, string[]> {
    let item = yield;
    return item.join("");
  }

  *List(annotation: List): Iterator<void, string, string[]> {
    let items: string[] = yield;
    if (annotation.attributes.type === "bulleted") {
      items = items.map((item) => {
        return `- ${item}`;
      });
    } else if (annotation.attributes.type === "numbered") {
      let startsAt = annotation.attributes.startsAt ?? 1;
      items = items.map((item, index) => {
        return `${startsAt + index}. ${item}`;
      });
    }
    return items.join("\n") + "\n\n";
  }

  *Paragraph(): Iterator<void, string, string[]> {
    let item = yield;
    return item.join("") + "\n\n";
  }
}
