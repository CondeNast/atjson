type node = {
  type: string;
  attributes: any;
  children: node[];
} | string;

// HIR test helpers for quickly generating JSON for
// the JSON output
function node(type: string) {
  return (...children: node[]) => {
    return {
      type,
      attributes: undefined,
      children
    };
  };
}

let bold = node('bold');
let document = node('root');
let image = node('image');
let italic = node('italic');
let li = node('list-item');
let ol = node('ordered-list');
let paragraph = node('paragraph');
let ul = node('unordered-list');

export { bold, document, image, italic, li, node, ol, paragraph, ul };
