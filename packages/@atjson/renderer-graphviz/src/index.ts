import Document from "@atjson/document";
import { HIR, HIRNode } from "@atjson/hir";

interface Node {
  id: string;
  label: string;
  color: string;
  text: string;
}

function getColor(rank: number) {
  if (rank === -Infinity) {
    return 'style=filled fillcolor="#000000" fontcolor="#FFFFFF"';
  } else if (rank <= 0) {
    return 'style=filled fillcolor="#222222" fontcolor="#FFFFFF"';
  } else if (rank <= 10) {
    return 'style=filled fillcolor="#444444" fontcolor="#FFFFFF"';
  } else if (rank <= 50) {
    return 'style=filled fillcolor="#666666" fontcolor="#FFFFFF"';
  } else if (rank <= 100) {
    return 'style=filled fillcolor="#888888" fontcolor="#FFFFFF"';
  } else if (rank <= 1000) {
    return 'style=filled fillcolor="#AAAAAA" fontcolor="#000000"';
  } else if (rank <= Number.MAX_SAFE_INTEGER) {
    return 'style=filled fillcolor="#CCCCCC" fontcolor="#000000"';
  } else {
    return 'style=filled fillcolor="#FFFFFF" fontcolor="#000000"';
  }
}

function generateGraph(
  hirNode: HIRNode,
  edges: Array<[Node, Node]>,
  nodes: Node[]
): Node {
  let children = hirNode.children({ includeParseTokens: true });
  let text = hirNode.type;
  if (hirNode.type === "text" && hirNode.text != null) {
    text = hirNode.text;
  } else {
    text = JSON.stringify(hirNode.annotation.attributes);
  }

  let node = {
    id: `${hirNode.type.replace("-", "_")}${nodes.length + 1}`,
    label: hirNode.type,
    color: getColor(hirNode.rank),
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
  static render(
    document: Document,
    options: GraphvizOptions = { shape: "oval" }
  ): string {
    let edges: Array<[Node, Node]> = [];
    let nodes: Node[] = [];
    generateGraph(new HIR(document).rootNode, edges, nodes);

    let dot: string;
    if (options.shape === "record" || options.shape === "Mrecord") {
      dot =
        nodes
          .map(
            node =>
              `  ${node.id} [label="{${node.label}|${node.text.replace(
                /"/g,
                '\\"'
              )}}" ${node.color}];`
          )
          .join("\n") +
        "\n" +
        edges
          .map(([parent, child]) => `  ${parent.id} -> ${child.id};`)
          .join("\n");
    } else {
      dot =
        nodes
          .map(
            node =>
              `  ${node.id} [label="${node.label}\\n${node.text.replace(
                /"/g,
                '\\"'
              )}" ${node.color}];`
          )
          .join("\n") +
        "\n" +
        edges
          .map(([parent, child]) => `  ${parent.id} -> ${child.id};`)
          .join("\n");
    }

    return `digraph atjson{
  node [shape=${options.shape}];
${dot}
}`;
  }
}
