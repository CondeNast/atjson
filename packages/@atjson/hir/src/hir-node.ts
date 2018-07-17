import Document, { Annotation, AnyAnnotation, ParseAnnotation } from '@atjson/document';
import { Root, Text } from './annotations';
import HIR from './hir';
import JSONNode from './json-node';

export interface Dictionary<T> {
  [key: string]: T | undefined;
}

export type HIRAttribute = string | number | boolean | null | HIRAttributeObject | HIRAttributeArray | HIR;
export interface HIRAttributeObject extends Dictionary<HIRAttribute> {}
export interface HIRAttributeArray extends Array<HIRAttribute> {}

export interface HIRAttributes {
  [key: string]: HIRAttribute;
}

export default class HIRNode {

  annotation: AnyAnnotation;
  attributes: HIRAttributes;
  start: number;
  end: number;

  get type() {
    return this.annotation.type;
  }

  get rank() {
    return this.annotation.rank;
  }

  private child?: HIRNode;
  private sibling?: HIRNode;

  constructor(annotation: Annotation) {
    this.annotation = annotation;
    this.start = annotation.start;
    this.end = annotation.end;
    this.attributes = Object.keys(annotation.attributes).reduce((attrs: any, key: string) => {
      let value = annotation.attributes[key];
      if (value instanceof Document) {
        attrs[key] = new HIR(value);
      } else {
        attrs[key] = value;
      }
      return attrs;
    }, {});
  }

  toJSON(): JSONNode | string {
    if (this.annotation instanceof Text && typeof this.attributes.text === 'string') {
      return this.attributes.text;
    }

    let attributes = Object.keys(this.attributes || {}).reduce((attrs: any, key: string) => {
      let value = this.attributes[key];
      if (value instanceof HIR) {
        attrs[key] = value.toJSON();
      } else {
        attrs[key] = value;
      }
      return attrs;
    }, {});

    return {
      type: this.type,
      attributes,
      children: this.children().map(child => {
        return child.toJSON();
      })
    };
  }

  children(): HIRNode[] {
    if (this.child) {
      return [this.child].concat(this.child.siblings()).filter(node => !(node.annotation instanceof ParseAnnotation));
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
    if (!(this.annotation instanceof Root)) {
      throw new Error('temporary exception; this should only exist in the root node subclass');
    }

    if (text.length === 0) return;

    // Don't insert Object Replacement Characters.
    if (text.length === 1 && this.end - this.start === 1 && text === '\uFFFC') return;

    let node = new HIRNode(new Text({
      start: this.start,
      end: this.end,
      attributes: { text }
    }));

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
    if (this.type !== 'text') {
      if (this.start === node.start && this.end === node.end) {
        this.insertChild(node);
        return;
      }

      if (this.start <= node.start) {
        if (node.start === node.end && this.end === node.end && this.rank === node.rank) {
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
          this.sibling.insertNode(node);
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
    let newStart = Math.max(this.start, start);
    let newEnd = Math.min(this.end, end);

    if (newStart === this.start && newEnd === this.end) {
      return this;
    }

    let partial = new HIRNode(this.annotation);
    partial.start = Math.min(Math.max(partial.start, start), partial.end);
    partial.end = Math.max(partial.start, Math.min(partial.end, end));

    if (partial.start === partial.end) return;

    if (partial.start > partial.end) {
      throw new Error('something has gone catastrophically wrong');
    }

    // nb move to HIRTextNode
    if (this.annotation instanceof Text && typeof this.attributes.text === 'string') {
      let text = this.attributes.text;
      partial.attributes.text = text.slice(partial.start - this.start, partial.end - this.start);
      if (partial.attributes.text === '\uFFFC') {
        return;
      }
    }

    return partial;
  }
}
