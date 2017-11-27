import { Annotation } from '@atjson/core';
import JSONNode from './json-node';

const ROOT_NODE_RANK = 0;
const BLOCK_NODE_RANK = 1;
const PARAGRAPH_NODE_RANK = 2;
const SPAN_NODE_RANK = 3;
const TEXT_NODE_RANK = Infinity;

export default class HIRNode {

  type: string;
  attributes?: object;

  start: number;
  end: number;

  text?: string;

  rank: number;

  private child: HIRNode | undefined;
  private sibling: HIRNode | undefined;

  constructor(node: {type: string, start: number, end: number, attributes?: object, text?: string}) {

    this.type = node.type;

    this.start = node.start;
    this.end = node.end;
    this.attributes = node.attributes;

    switch (node.type) {
      case 'root':
        this.rank = ROOT_NODE_RANK;
        break;

      case 'text':
        if (typeof(node.text) === 'string') {
          this.text = node.text.slice(node.start, node.end);
          this.rank = TEXT_NODE_RANK;
        } else {
          throw new Error('Encountered a text node with no text.');
        }
        break;

      case 'paragraph':
        this.rank = PARAGRAPH_NODE_RANK;
        break;

      case 'bold':
      case 'italic':
        this.rank = SPAN_NODE_RANK;
        break;

      case 'ordered-list':
      case 'unordered-list':
      case 'list-item':
      case 'blockquote':
      case 'callout':
      case 'embed':
      case 'asset':
        this.rank = BLOCK_NODE_RANK;
        break;

      default:
        this.rank = SPAN_NODE_RANK;
    }
  }

  toJSON(filter?: (node: HIRNode) => HIRNode): JSONNode|string {
    let thisNode: HIRNode = this;
    if (filter) {
      thisNode = filter(this);
    }

    if (thisNode.type === 'text' && typeof(thisNode.text) === 'string') {
      return thisNode.text;
    }

    return {
      type: thisNode.type,
      attributes: thisNode.attributes,
      children: thisNode.children().map(child => {
        return child.toJSON(filter);
      })
    };
  }

  children(): HIRNode[] {
    if (this.child) {
      return [this.child].concat(this.child.siblings());
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
    let hirNode = new HIRNode(annotation);
    this.insertNode(hirNode);
  }

  insertText(text: string): void {
    if (this.type !== 'root') {
      throw new Error('temporary exception; this should only exist in the root node subclass');
    }

    if (text.length === 0) return;

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

      if (this.type === 'paragraph' && node.type === 'paragraph') {
        this.insertSibling(node);
        return;
      }

      if (this.start <= node.start) {
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

  trim(start: number, end: number): HIRNode|void {
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
    }

    return newNode;
  }
}
