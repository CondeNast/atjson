import { Annotation, Schema } from '@atjson/document';
import JSONNode from './json-node';

const RANK = {
  root: 0,
  block: 1,
  paragraph: 2,
  inline: 3,
  object: 4,
  parse: Number.MAX_SAFE_INTEGER,
  text: Infinity
};

export default class HIRNode {

  type: string;
  attributes?: object;

  start: number;
  end: number;

  text?: string;

  rank: number;

  private child: HIRNode | undefined;
  private sibling: HIRNode | undefined;
  private schema: Schema;

  constructor(node: {type: string, start: number, end: number, attributes?: object, text?: string}, schema: Schema) {
    this.type = node.type;
    this.start = node.start;
    this.end = node.end;
    this.attributes = node.attributes;
    this.rank = RANK.inline;
    this.precedence = 0;
    this.schema = schema || {};

    // Handle built-in types first
    if (node.type === 'text' && typeof node.text === 'string') {
      this.rank = RANK.text;
      this.text = node.text;
    } else if (node.type === 'parse-token') {
      this.rank = RANK.parse;
    } else if (node.type === 'root') {
      this.rank = RANK.root;
    } else if (this.schema[this.type]) {
      this.rank = RANK[this.schema[this.type].type];
    }
  }

  toJSON(): JSONNode | string {
    if (this.type === 'text' && typeof this.text === 'string') {
      return this.text;
    }

    return {
      type: this.type,
      attributes: this.attributes,
      children: this.children().map(child => {
        return child.toJSON();
      })
    };
  }

  children(): HIRNode[] {
    if (this.child) {
      return [this.child].concat(this.child.siblings()).filter(node => node.type !== 'parse-token');
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
    let hirNode = new HIRNode(annotation, this.schema);
    this.insertNode(hirNode);
  }

  insertText(text: string): void {
    if (this.type !== 'root') {
      throw new Error('temporary exception; this should only exist in the root node subclass');
    }

    if (text.length === 0) return;

    // Don't insert Object Replacement Characters.
    if (text.length === 1 && this.end - this.start === 1 && text === '\uFFFC') return;

    let node = new HIRNode({
      text,
      type: 'text',
      start: this.start,
      end: this.end
    });

    this.insertNode(node);
  }

  insertNode(node: HIRNode): void {
    let insertedWholeNode = false;

    /* Don't insert nodes into text nodes; always append them as siblings.
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
        // FIXME FIXME FIXME this needs refacotring, as with below.
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

    let newNode = new HIRNode(this);
    newNode.start = Math.min(Math.max(newNode.start, start), newNode.end);
    newNode.end = Math.max(newNode.start, Math.min(newNode.end, end));

    if (newNode.start === newNode.end) return;

    if (newNode.start > newNode.end) {
      throw new Error('something has gone catastrophically wrong');
    }

    // nb move to HIRTextNode
    if (newNode.type === 'text' && typeof(this.text) === 'string') {
      newNode.text = this.text.slice(newNode.start - this.start, newNode.end - this.start);
      if (newNode.text === '\uFFFC') {
        return;
      }
    }

    return newNode;
  }
}
