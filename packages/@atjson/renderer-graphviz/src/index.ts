import Document from '@atjson/document';
import { HIR, HIRNode } from '@atjson/hir';

interface Node {
  id: string;
  label: string;
  text: string;
}

function generateGraph(hirNode: HIRNode, edges: Array<[Node, Node]>, nodes: Node[]): Node {
  let children = hirNode.children();
  let text = hirNode.type;
  if (hirNode.type === 'text' && hirNode.text != null) {
    text = hirNode.text;
  } else {
    text = JSON.stringify(hirNode.attributes);
  }

  let node = {
    id: `${hirNode.type}${nodes.length + 1}`,
    label: hirNode.type,
    text
  };
  nodes.push(node);

  children.forEach((child: HIRNode) => {
    edges.push([node, generateGraph(child, edges, nodes)]);
  });

  return node;
}

export interface GraphvizOptions {
  shape: string;
}

export default class GraphvizRenderer {
  render(document: Document, options: GraphvizOptions = { shape: 'oval' }): string {
    let edges: Array<[Node, Node]> = [];
    let nodes: Node[] = [];
    generateGraph(new HIR(document).rootNode, edges, nodes);

    let dot: string;
    if (options.shape === 'record' || options.shape === 'Mrecord') {
      dot = nodes.map(node => `  ${node.id} [label="{${node.label}|${node.text.replace(/"/g, '\\"')}}"];`).join('\n') + '\n' +
            edges.map(([parent, child]) => `  ${parent.id} -> ${child.id};`).join('\n');
    } else {
      dot = nodes.map(node => `  ${node.id} [label="${node.label}\\n${node.text.replace(/"/g, '\\"')}"];`).join('\n') + '\n' +
            edges.map(([parent, child]) => `  ${parent.id} -> ${child.id};`).join('\n');
    }

    return `digraph atjson{
  node [shape=${options.shape}];
${dot}
}`;
  }
}
