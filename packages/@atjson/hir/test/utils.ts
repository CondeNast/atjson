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
      attributes: {},
      children
    };
  };
}

let bold = node('Bold');
let blockquote = node('Blockquote');
let document = node('Root');
let image = (attributes= {}) => {
  return {
    type: 'Image',
    attributes,
    children: []
  };
};
let italic = node('Italic');
let li = node('ListItem');
let ol = node('OrderedList');
let paragraph = node('Paragraph');
let ul = node('UnorderedList');

export { bold, blockquote, document, image, italic, li, node, ol, paragraph, ul };
