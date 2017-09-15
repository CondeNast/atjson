import { Annotation } from 'atjson';

const ROOT_NODE_RANK = 0;
const BLOCK_NODE_RANK = 1;
const PARAGRAPH_NODE_RANK = 2;
const SPAN_NODE_RANK = 3;
const TEXT_NODE_RANK = Infinity;

export default class HIRNode {

  type: string;
  attributes?: Object;

  start: number;
  end: number;

  private child: HIRNode | undefined;
  private sibling: HIRNode | undefined;

  node: any;
  text: any;

  rank: number;

  constructor(node: any) {
    this.type = node.type;

    this.start = node.start;
    this.end = node.end;
    this.attributes = node.attributes;

    switch (node.type) {
      case 'root':
        this.rank = ROOT_NODE_RANK;
        break;

      case 'text':
        this.text = node.text.slice(node.start, node.end);
        this.rank = TEXT_NODE_RANK;
        break;

      case 'paragraph':
        this.rank = PARAGRAPH_NODE_RANK;
        break;

      case 'bold':
      case 'italic':
        this.rank = SPAN_NODE_RANK;
        break;

      case 'ordered-list':
      case 'list-item':
        this.rank = BLOCK_NODE_RANK;
        break;

      default:
        this.rank = SPAN_NODE_RANK;
    }
  }

  toJSON(): object {
    if (this.type === 'text') {
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

  children(): Array<HIRNode> {
    if (this.child) {
      return [this.child].concat(this.child.siblings());
    } else {
      return [];
    }
  }

  siblings(): Array<HIRNode> {
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
    if (this.type != 'root') {
      throw new Error('temporary exception; this should only exist in the root node subclass');
    }

    let node = new HIRNode({
      type: 'text',
      start: this.start,
      end: this.end,
      text: text
    });

    this.insertNode(node);
  }

  insertNode(node: HIRNode): void {
    if (this.start <= node.start) {
      let childNode = node.trim(this.start, this.end);
      if (childNode) this.insertChild(childNode);
    }

    if (this.end <= node.end) {
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
    if (newNode.type === 'text') {
      newNode.text = this.text.slice(newNode.start - this.start, newNode.end - this.start);
    }

    return newNode;
  }

    /*
  insertAnnotation(annotation: Annotation): Annotation|void {
    if (this.end <= annotation.start) {
      return annotation;

    } else if (this.start > annotation.end) {
      return annotation;

    } else {
      let remainingAnnotation = this.insertAnnotationIntoChildren(annotation);

      if (remainingAnnotation === undefined) {
        return;
      } else if (remainingAnnotation.start < this.end) {
        let childHIRNode = new HIRNode(remainingAnnotation);
        let leftoverAnnotation = {...remainingAnnotation} as Annotation;

        childHIRNode.end = Math.min(childHIRNode.end, this.end);
        childHIRNode.start = Math.max(childHIRNode.start, this.start);
        leftoverAnnotation.start = this.end; // is this right?

        this.children.push(childHIRNode);

        if (leftoverAnnotation.start > leftoverAnnotation.end) {
          return;
        } else {
          if (leftoverAnnotation.end < this.end) {
            return;
          } else {
            return leftoverAnnotation;
          }
        }
      }
    }
  }

  insertAnnotationIntoChildren(annotation: Annotation): Annotation {
    if (this.children.length === 0) {
      return annotation;
    } else {
      return this.children.reduce((resultAnnotation: Annotation, child: HIRNode|string) => {
        if (typeof child === 'string') {
          // Just skip for now. This annotation *should not* currently
          // intersect with the string.
          return resultAnnotation;
        } else if (child instanceof HIRNode) {
          return child.insertAnnotation(annotation);
        } else {
          throw new Error('this was not supposed to happen');
        }
      }, annotation);
    }
  }

  insertText(text: string): string|void {

    let strOffset = this.start;

    let newChildren = [];

    this.children.forEach((child, i) => {
      if (strOffset < child.start) {
        newChildren.push(text.slice(0, child.start - strOffset));
        text = text.slice(child.start - strOffset);
      }

      if (strOffset < child.end) {
        text = child.insertText(text);
      }

      newChildren.push(child);
      strOffset = child.end;
    });

    if (text.length > 0 && strOffset < this.end) {
      newChildren.push(text.slice(0, this.end - strOffset));
      text = text.slice(this.end - strOffset);
    }

    this.children = newChildren;

    return text;
  }
  */
}
