import { AnnotationJSON, ParseAnnotation } from "@atjson/document";
import * as entities from "entities";

export interface Attributes {
  [key: string]: string | number | boolean | null;
}

function getAttributes(token: Token): Attributes {
  let attributes: Attributes = {};
  if (token.attrs) {
    for (let attribute of token.attrs) {
      attributes[`-commonmark-${attribute[0]}`] = attribute[1];
    }
  }

  return attributes;
}

interface Token {
  attrs: string[][];
  block: boolean;
  children: Token[];
  content: string;
  hidden: boolean;
  info: string;
  level: number;
  map: number[];
  markup: string;
  meta: any;
  nesting: number;
  tag: string;
  type: string;
}

export interface Node {
  name: string;
  open?: Token;
  close?: Token;
  value?: Token | string;
  parent?: Node;
  children: Node[];
}

function toTree(tokens: Token[], rootNode: Node) {
  let currentNode = rootNode;
  for (let token of tokens) {
    // Ignore softbreak as per markdown-it defaults
    if (token.tag === "br" && token.type === "softbreak") {
      currentNode.children.push({
        name: "text",
        value: "\n",
        parent: currentNode,
        children: []
      });
    } else if (token.type === "text") {
      currentNode.children.push({
        name: "text",
        value: token.content,
        parent: currentNode,
        children: []
      });
    } else if (token.type === "inline") {
      toTree(token.children, currentNode);
    } else if (token.children && token.children.length > 0) {
      let node = {
        name: token.type,
        open: token,
        parent: currentNode,
        children: []
      };
      currentNode.children.push(node);
      toTree(token.children, node);
    } else if (token.nesting === 1) {
      let node = {
        name: token.type.replace(/_open$/, ""),
        open: token,
        close: token,
        parent: currentNode,
        children: []
      };
      currentNode.children.push(node);
      currentNode = node;
    } else if (token.nesting === -1) {
      currentNode.close = token;
      if (currentNode.parent) {
        currentNode = currentNode.parent;
      }
    } else {
      let text = token.content;
      // If there is a backtick as the first or last
      // character, we need to provide spaces around
      // the code, otherwise we'll get two code blocks
      // instead of one code block with backticks in it
      if (token.type === "code_inline") {
        if (text[0] === "`") {
          text = " " + text;
        }
        if (text[text.length - 1] === "`") {
          text += " ";
        }
      }
      currentNode.children.push({
        name: token.type,
        open: token,
        close: token,
        parent: currentNode,
        children: [
          {
            name: "text",
            value: text,
            parent: currentNode,
            children: []
          }
        ]
      });
    }
  }
  return rootNode;
}

function getText(node: Node): Node[] {
  let textNodes: Node[] = [];
  for (let child of node.children) {
    if (child.name === "text") {
      textNodes.push(child);
    } else if (child.children) {
      textNodes.push(...getText(child));
    }
  }
  return textNodes;
}

function getValue(n: Node) {
  return n.value;
}

export default class Parser {
  content: string;
  annotations: AnnotationJSON[];
  private handlers: any;

  constructor(tokens: Token[], handlers: any) {
    this.content = "";
    this.handlers = handlers;
    this.annotations = [];
    this.walk(toTree(tokens, { name: "root", children: [] }).children);
  }

  walk(nodes: Node[]) {
    for (let node of nodes) {
      if (node.name === "text") {
        this.content += node.value;
      } else if (node.open) {
        // Markdown-It strips out all unicode whitespace characters.
        if (node.name === "paragraph" && node.children.length === 0) {
          node.children.push({
            name: "text",
            parent: node,
            value: "\u202F",
            children: []
          });
        } else if (node.name === "image" && node.open) {
          let token = node.open;
          token.attrs = token.attrs || [];
          token.attrs.push([
            "alt",
            getText(node)
              .map(getValue)
              .join("")
          ]);
          node.children = [];
        }
        let attrs: Attributes = {};
        // Identify whether the list is tight (paragraphs collapse)
        if (
          (node.name === "bullet_list" || node.name === "ordered_list") &&
          node.open
        ) {
          let isTight = false;

          for (let items of node.children) {
            for (let child of items.children) {
              if (
                child.name === "paragraph" &&
                !!(child.open && child.open.hidden)
              ) {
                isTight = true;
              }
            }
          }

          attrs["-commonmark-tight"] = isTight;
        }
        let annotationGenerator = this.convertTokenToAnnotation(
          node.name,
          node.open,
          attrs
        );
        annotationGenerator.next();
        this.walk(node.children);
        annotationGenerator.next();
      }
    }
  }

  *convertTokenToAnnotation(
    name: string,
    open: Token,
    attrs: Attributes
  ): IterableIterator<void> {
    let start = this.content.length;
    this.content += "\uFFFC";
    this.annotations.push(
      new ParseAnnotation({
        start,
        end: start + 1,
        attributes: {
          reason: `${name}_open`
        }
      })
    );

    let closingToken = yield;

    this.content += "\uFFFC";

    let end = this.content.length;
    let attributes = Object.assign(getAttributes(open), attrs || {});
    if (name === "heading") {
      attributes["-commonmark-level"] = parseInt(open.tag[1], 10);
    }
    if (name === "fence") {
      attributes["-commonmark-info"] = entities.decodeHTML5(open.info.trim());
    }

    if (this.handlers[name]) {
      Object.assign(attributes, this.handlers[name](open, closingToken));
    }
    this.annotations.push(
      new ParseAnnotation({
        start: end - 1,
        end,
        attributes: {
          reason: `${name}_close`
        }
      }),
      {
        type: `-commonmark-${name}`,
        start,
        end,
        attributes
      }
    );
  }
}
