import Document, {
  Annotation,
  JSON,
  ParseAnnotation,
  is
} from "@atjson/document";
import { Root, Text } from "./annotations";

export interface Dictionary<T> {
  [key: string]: T | undefined;
}

function toJSON(attribute: NonNullable<any>): JSON {
  if (Array.isArray(attribute)) {
    return attribute.map(toJSON);
  } else if (attribute instanceof Document) {
    return attribute.toJSON();
  } else if (attribute == null) {
    return null;
  } else if (typeof attribute === "object") {
    let copy: NonNullable<any> = {};
    for (let key in attribute) {
      let value = attribute[key];
      if (value == null) {
        copy[key] = value;
      } else {
        copy[key] = toJSON(value);
      }
    }
    return copy;
  } else {
    return attribute;
  }
}

function isNotParseAnnotation(node: HIRNode) {
  return !is(node.annotation, ParseAnnotation);
}

export default class HIRNode {
  annotation: Annotation;
  id: string;
  rank: number;
  type: string;
  start: number;
  end: number;
  text: string;

  private child?: HIRNode;
  private sibling?: HIRNode;

  constructor(
    annotation:
      | Annotation<any>
      | {
          id: string;
          type: string;
          start: number;
          end: number;
          annotation: Annotation<any>;
          rank: number;
          text?: string;
        }
  ) {
    if (annotation instanceof Annotation) {
      this.annotation = annotation;
      this.id = annotation.id;
      this.type = annotation.type;
      this.start = annotation.start;
      this.end = annotation.end;
      this.rank = annotation.rank;
      this.text = "";
    } else {
      this.annotation = annotation.annotation;
      this.id = annotation.id;
      this.type = annotation.type;
      this.start = annotation.start;
      this.end = annotation.end;
      this.rank = annotation.rank;
      this.text = annotation.text || "";
    }
  }

  toJSON(options?: { includeParseTokens: boolean }): JSON {
    if (is(this.annotation, Text)) {
      return this.text;
    }

    return {
      id: this.id,
      type: this.type,
      attributes: toJSON(this.annotation.attributes),
      children: this.children(options).map(function toJSONWithOptions(child) {
        return child.toJSON(options);
      })
    };
  }

  children(options?: { includeParseTokens: boolean }): HIRNode[] {
    if (this.child) {
      let children = [this.child].concat(this.child.siblings());
      if (!options || !options.includeParseTokens) {
        children = children.filter(isNotParseAnnotation);
      }
      return children;
    } else {
      return [];
    }
  }

  siblings(): HIRNode[] {
    if (this.sibling) {
      return [this.sibling].concat(this.sibling.siblings());
    } else {
      return [];
    }
  }

  insertAnnotation(annotation: Annotation): void {
    this.insertNode(new HIRNode(annotation));
  }

  insertText(text: string): void {
    if (!is(this.annotation, Root)) {
      throw new Error(
        "temporary exception; this should only exist in the root node subclass"
      );
    }

    if (text.length === 0) return;

    // Don't insert Object Replacement Characters.
    if (text.length === 1 && this.end - this.start === 1 && text === "\uFFFC")
      return;

    let annotation = new Text({
      start: this.start,
      end: this.end,
      attributes: { text }
    });
    let node = new HIRNode({
      type: annotation.type,
      id: annotation.id,
      start: this.start,
      end: this.end,
      rank: annotation.rank,
      text,
      annotation
    });

    this.insertNode(node);
  }

  insertNode(node: HIRNode): void {
    let insertedWholeNode = false;

    /**
     * Don't insert nodes into text nodes; always append them as siblings.
     *
     * FIXME this should probably check to see if the node in question overlaps
     * with the text node, and if so, subsume the text node (this) into the
     * given node (node)
     */
    if (this.type !== "text") {
      if (this.start === node.start && this.end === node.end) {
        this.insertChild(node);
        return;
      }

      if (this.start <= node.start) {
        if (
          node.start === node.end &&
          this.end === node.end &&
          this.rank === node.rank
        ) {
          this.insertSibling(node);
          return;
        }

        let childNode = node.trim(this.start, this.end);
        if (childNode) {
          this.insertChild(childNode);
          if (childNode.end === node.end) insertedWholeNode = true;
        }
      }
    }

    if (this.end <= node.end && !insertedWholeNode) {
      let siblingNode = node.trim(this.end, node.end);
      if (siblingNode) this.insertSibling(siblingNode);
    }
  }

  insertSibling(node: HIRNode): void {
    if (!this.sibling) {
      this.sibling = node;
    } else {
      if (node.rank < this.sibling.rank) {
        // FIXME FIXME FIXME this needs refactoring, as with below.
        if (this.sibling.start < node.start) {
          let preSibling = this.sibling.trim(this.end, node.start);
          let postSibling = this.sibling.trim(node.start, this.sibling.end);

          if (postSibling) {
            node.insertNode(postSibling);
          }

          if (preSibling) {
            preSibling.insertNode(node);
            this.sibling = preSibling;
          } else {
            this.sibling = node;
          }
        } else {
          node.insertNode(this.sibling);
          this.sibling = node;
        }
      } else {
        if (node.start < this.sibling.start) {
          let preSibling = node.trim(this.end, this.sibling.start);
          let postSibling = node.trim(this.sibling.start, node.end);

          if (postSibling) {
            this.sibling.insertNode(postSibling);
          }

          if (preSibling) {
            preSibling.insertNode(this.sibling);
            this.sibling = preSibling;
          }
        } else {
          let sibling: HIRNode = this.sibling;
          while (
            sibling.sibling &&
            node.start >= sibling.sibling.end &&
            node.rank >= sibling.sibling.rank
          ) {
            if (sibling.sibling) {
              sibling = sibling.sibling;
            } else {
              break;
            }
          }
          sibling.insertNode(node);
        }
      }
    }
  }

  insertChild(node: HIRNode): void {
    if (!this.child) {
      this.child = node;
    } else {
      // FIXME FIXME FIXME this needs some refactoring for clarity / symmetry.
      if (node.rank < this.child.rank) {
        if (this.child.start < node.start) {
          let preChild = this.child.trim(this.child.start, node.start);
          let postChild = this.child.trim(this.start, this.child.end);

          if (postChild) {
            node.insertNode(postChild);
          }

          if (preChild) {
            preChild.insertNode(node);
            this.child = preChild;
          }
        } else {
          node.insertNode(this.child);
          this.child = node;
        }
      } else {
        if (node.start < this.child.start) {
          let preChild = node.trim(this.start, this.child.start);
          let postChild = node.trim(this.child.start, node.end);

          if (postChild) {
            this.child.insertNode(postChild);
          }

          if (preChild) {
            preChild.insertNode(this.child);
            this.child = preChild;
          }
        } else {
          this.child.insertNode(node);
        }
      }
    }
  }

  trim(start: number, end: number): HIRNode | void {
    let newStart = Math.min(Math.max(this.start, start), this.end);
    let newEnd = Math.max(this.start, Math.min(this.end, end));

    if (newStart === this.start && newEnd === this.end) {
      return this;
    }

    let partial = is(this.annotation, Text)
      ? new HIRNode({
          id: this.id,
          type: this.type,
          annotation: this.annotation,
          rank: this.rank,
          start: newStart,
          end: newEnd,
          text: this.text.slice(newStart - this.start, newEnd - this.start)
        })
      : new HIRNode({
          id: this.id,
          type: this.type,
          rank: this.rank,
          annotation: this.annotation,
          start: newStart,
          end: newEnd
        });

    if (partial.start === partial.end) return;

    if (partial.start > partial.end) {
      throw new Error("something has gone catastrophically wrong");
    }

    // nb move to HIRTextNode
    if (is(this.annotation, Text) && partial.text === "\uFFFC") {
      return;
    }

    return partial;
  }
}
