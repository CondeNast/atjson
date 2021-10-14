import { AnnotationJSON, ParseAnnotation } from "@atjson/document";
import * as parse5 from "parse5";

const LEADING_WHITESPACE = /^\s+/;

function isElement(node: parse5.Node): node is parse5.Element {
  return (
    node.nodeName !== undefined &&
    node.nodeName !== "#text" &&
    node.nodeName !== ""
  );
}

function isText(node: parse5.Node): node is parse5.TextNode {
  return node.nodeName === "#text";
}

function getAttributes(node: parse5.Element): NonNullable<any> {
  if (!node.attrs) return {};

  let attributes: NonNullable<any> = {};
  for (let attr of node.attrs) {
    if (attr.name.indexOf("data-") === 0) {
      if (attributes["-html-dataset"] == null) attributes["-html-dataset"] = {};
      attributes["-html-dataset"][attr.name.slice(5)] = attr.value;
    } else {
      attributes[`-html-${attr.name}`] = attr.value;
    }
  }

  let href = attributes["-html-href"];
  if (node.tagName === "a" && typeof href === "string") {
    attributes["-html-href"] = decodeURI(href);
  }

  return attributes;
}

export default class Parser {
  content: string;

  annotations: AnnotationJSON[];

  private html: string;

  private offset: number;

  constructor(html: string) {
    this.html = html;
    let leadingWhitespace = html.match(LEADING_WHITESPACE);

    this.content = leadingWhitespace ? leadingWhitespace[0] : "";
    this.annotations = [];
    this.offset = 0;

    // By using `parse` all the time,
    // we can handle `<!DOCTYPE html>` declarations
    // and HTML fragments cleanly.
    let tree = parse5.parse(this.html, { sourceCodeLocationInfo: true });

    this.walk(tree.childNodes);
  }

  walk(nodes: parse5.Node[]) {
    if (!nodes) return;
    for (let node of nodes) {
      if (isElement(node)) {
        let elementNode = node;
        let annotationGenerator = this.convertNodeToAnnotation(elementNode);
        // <tag>
        annotationGenerator.next();
        this.walk(elementNode.childNodes);
        // </tag>
        annotationGenerator.next();
      } else if (isText(node)) {
        let textNode = node;
        let location = textNode.sourceCodeLocation;
        if (location) {
          let html = this.html.slice(location.startOffset, location.endOffset);
          let text = textNode.value;
          this.content += text;
          this.offset += html.length - text.length;
        }
      }
    }
  }

  convertTag(node: parse5.Element, which: "startTag" | "endTag"): number {
    let location = node.sourceCodeLocation;
    if (location == null) return -1;

    let { startOffset: start, endOffset: end } = location[which];
    let reason =
      which === "startTag" ? `<${node.tagName}>` : `</${node.tagName}>`;
    this.annotations.push(
      new ParseAnnotation({
        attributes: { reason },
        start: start - this.offset,
        end: end - this.offset,
      })
    );
    this.content += this.html.slice(start, end);
    return end - this.offset;
  }

  *convertNodeToAnnotation(node: parse5.Element): IterableIterator<void> {
    let location = node.sourceCodeLocation;
    let tagName = node.tagName;

    if (location == null) {
      yield;
      return;
    }

    if (location.startTag && location.endTag) {
      let start = location.startTag.startOffset - this.offset;
      this.convertTag(node, "startTag");

      yield;

      let end = this.convertTag(node, "endTag");
      this.annotations.push({
        type: `-html-${tagName}`,
        attributes: getAttributes(node),
        start,
        end,
      });
    } else if (location.startTag) {
      let start = location.startTag.startOffset - this.offset;
      this.convertTag(node, "startTag");

      yield;

      this.annotations.push({
        type: `-html-${tagName}`,
        attributes: getAttributes(node),
        start,
        end: location.endOffset - this.offset,
      });
    } else {
      let start = location.startOffset - this.offset;
      let end = location.endOffset - this.offset;

      this.content += this.html.slice(location.startOffset, location.endOffset);
      this.annotations.push(
        new ParseAnnotation({
          attributes: { reason: `<${tagName}/>` },
          start,
          end,
        })
      );

      // Handle `<!DOCTYPE html>` gracefully
      if (tagName) {
        this.annotations.push({
          type: `-html-${tagName}`,
          attributes: getAttributes(node),
          start,
          end,
        });
      }

      yield;
    }
  }
}
