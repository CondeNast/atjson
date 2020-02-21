import Document, { AttributesOf, InlineAnnotation } from "@atjson/document";
import Renderer, { ReactRendererProvider } from "@atjson/renderer-react";
import * as React from "react";
import { FC, useRef, useState } from "react";
import styled from "styled-components";
// @ts-ignore
import { useResizeObserver } from "./hooks.ts";

const Wrapper = styled.h4`
  position: relative;
  text-align: center;
  margin: 3rem 0 8rem;
`;

const Container = styled.div`
  position: relative;
`;

const SVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;

  path {
    pointer-events: none;
  }

  text {
    cursor: default;
  }

  rect {
    transition: all 120ms;
    mix-blend-mode: multiply;
  }
`;

export class Comment extends InlineAnnotation<{ name: string }> {
  static vendorPrefix = "qbf";
  static type = "comment";
}

export class Image extends InlineAnnotation<{
  src: string;
}> {
  static vendorPrefix = "qbf";
  static type = "image";
}

export class Italic extends InlineAnnotation {
  static vendorPrefix = "qbf";
  static type = "italic";
}

export class TextColor extends InlineAnnotation<{
  color: string;
}> {
  static vendorPrefix = "qbf";
  static type = "text-color";
}

export class QuickBrownFoxSource extends Document {
  static contentType = "application/vnd.atjson+quick-brown-fox";
  static schema = [Comment, Image, Italic, TextColor];
}

const ItalicComponent: FC<AttributesOf<Italic>> = props => {
  return <em>{props.children}</em>;
};

const TextColorComponent: FC<AttributesOf<TextColor>> = props => {
  return <span style={{ color: props.color }}>{props.children}</span>;
};

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

const BelowBrace: FC<Position> = props => {
  let x1 = props.x;
  let x2 = props.x + props.width;
  let y1 = props.y + props.height - 2;
  let y2 = y1;

  let dx = x1 - x2;
  let dy = y1 - y2;
  let q = 0.5;
  let w = 8;
  let length = Math.sqrt(dx * dx + dy * dy);
  dx = dx / length;
  dy = dy / length;

  // Calculate Control Points of path,
  let qx1 = x1 + q * w * dy;
  let qy1 = y1 - q * w * dx;
  let qx2 = x1 - 0.25 * length * dx + (1 - q) * w * dy;
  let qy2 = y1 - 0.25 * length * dy - (1 - q) * w * dx;
  let tx1 = x1 - 0.5 * length * dx + w * dy;
  let ty1 = y1 - 0.5 * length * dy - w * dx;
  let qx3 = x2 + q * w * dy;
  let qy3 = y2 - q * w * dx;
  let qx4 = x1 - 0.75 * length * dx + (1 - q) * w * dy;
  let qy4 = y1 - 0.75 * length * dy - (1 - q) * w * dx;

  let path = [
    `M ${x1},${y1}`,
    `Q ${qx1},${qy1} ${qx2},${qy2}`,
    `T ${tx1},${ty1}`,
    `M ${x2},${y2}`,
    `Q ${qx3},${qy3} ${qx4},${qy4}`,
    `T ${tx1},${ty1}`
  ];

  return (
    <path d={path.join(" ")} stroke="#0023FF" strokeWidth={1} fill="none" />
  );
};

const AboveBrace: FC<Position> = props => {
  let x1 = props.x;
  let x2 = props.x + props.width;
  let y1 = props.y + 2;
  let y2 = y1;

  let dx = x1 - x2;
  let dy = y1 - y2;
  let q = 0.5;
  let w = -8;
  let length = Math.sqrt(dx * dx + dy * dy);
  dx = dx / length;
  dy = dy / length;

  // Calculate Control Points of path,
  let qx1 = x1 + q * w * dy;
  let qy1 = y1 - q * w * dx;
  let qx2 = x1 - 0.25 * length * dx + (1 - q) * w * dy;
  let qy2 = y1 - 0.25 * length * dy - (1 - q) * w * dx;
  let tx1 = x1 - 0.5 * length * dx + w * dy;
  let ty1 = y1 - 0.5 * length * dy - w * dx;
  let qx3 = x2 + q * w * dy;
  let qy3 = y2 - q * w * dx;
  let qx4 = x1 - 0.75 * length * dx + (1 - q) * w * dy;
  let qy4 = y1 - 0.75 * length * dy - (1 - q) * w * dx;

  let path = [
    `M ${x1},${y1}`,
    `Q ${qx1},${qy1} ${qx2},${qy2}`,
    `T ${tx1},${ty1}`,
    `M ${x2},${y2}`,
    `Q ${qx3},${qy3} ${qx4},${qy4}`,
    `T ${tx1},${ty1}`
  ];

  return (
    <path d={path.join(" ")} stroke="#0023FF" strokeWidth={1} fill="none" />
  );
};

const ImageComponent: FC<AttributesOf<Image> & Position> = props => {
  let [isHovered, setHovered] = useState(false);

  return (
    <g>
      <BelowBrace {...props} />
      <rect
        x={props.x - 2}
        y={props.y}
        width={props.width + 4}
        height={props.height}
        fill={isHovered ? "rgba(0, 52, 255, 0.25)" : "rgba(0, 52, 255, 0)"}
      />
      <image
        xlinkHref={props.src}
        x={props.x - 30}
        y={props.y + props.height + 10}
        width={props.width + 60}
        height={0.6635654659805603 * (props.width + 60)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
    </g>
  );
};

const CommentComponent: FC<AttributesOf<Comment> & Position> = props => {
  let [isHovered, setHovered] = useState(false);

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AboveBrace {...props} />
      <rect
        x={props.x - 2}
        y={props.y}
        width={props.width + 4}
        height={props.height}
        fill={isHovered ? "rgba(0, 52, 255, 0.25)" : "rgba(0, 52, 255, 0)"}
      />
      <text
        x={props.x}
        y={props.y - 12}
        width={props.width}
        dx={props.width / 2}
        textAnchor="middle"
      >
        {props.name}
      </text>
    </g>
  );
};

function getNodeAndOffset(
  offset: number,
  nodes: NodeListOf<ChildNode>
): [Node, number] {
  let start = 0;
  let nodeIndex = 0;
  let node = nodes[nodeIndex];

  while (offset > start) {
    let length = (node.textContent || "").length;
    if (offset < start + length) {
      return [node, offset - start];
    }
    nodeIndex++;
    node = nodes[nodeIndex];
    start = start + length;
  }

  return [node, offset - start];
}

const offscreenComponents: { [key: string]: FC<any> } = {
  Image: ImageComponent,
  Comment: CommentComponent
};

export const QuickBrownFox: FC<{
  value: QuickBrownFoxSource;
}> = props => {
  let wrapper = useRef<HTMLHeadingElement>(null);
  let [positions, setPositions] = useState<{
    [id: string]: ClientRect | DOMRect;
  }>({});

  // We're going to render the rest of the annotations
  // off in a separate set of DOM so we can have them
  // overlap in a way that is otherwise impossible for DOM
  useResizeObserver(
    wrapper,
    () => {
      if (wrapper.current) {
        let annotations = props.value.where(
          a => !(a instanceof Italic) && !(a instanceof TextColor)
        );
        let range = document.createRange();
        let annotationPositions: { [id: string]: ClientRect | DOMRect } = {};
        let childNodes = wrapper.current.childNodes;

        for (let annotation of annotations) {
          let [startNode, startOffset] = getNodeAndOffset(
            annotation.start,
            childNodes
          );
          range.setStart(startNode, startOffset);
          let [endNode, endOffset] = getNodeAndOffset(
            annotation.end,
            childNodes
          );
          range.setEnd(endNode, endOffset);

          annotationPositions[annotation.id] = range.getBoundingClientRect();
        }
        setPositions(annotationPositions);
      }
    },
    [props.value]
  );

  return (
    <Container>
      <SVG>
        {Object.keys(positions).map(id => {
          let rect = positions[id];
          let annotation = props.value.annotations.find(a => a.id === id)!;
          let boundingRect = wrapper.current!.getBoundingClientRect();
          let offsetLeft = boundingRect.left;
          let offsetTop = boundingRect.top;

          if (annotation == null) return;

          let name =
            annotation.type[0].toUpperCase() + annotation.type.slice(1);
          let Component = offscreenComponents[name];

          return (
            <Component
              key={id}
              x={rect.left - offsetLeft}
              y={rect.top - offsetTop}
              width={rect.width}
              height={rect.height}
              {...annotation.attributes}
            />
          );
        })}
      </SVG>
      <Wrapper ref={wrapper}>
        <ReactRendererProvider
          value={{
            Italic: ItalicComponent,
            TextColor: TextColorComponent
          }}
        >
          {Renderer.render(props.value)}
        </ReactRendererProvider>
      </Wrapper>
    </Container>
  );
};
