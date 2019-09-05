import * as React from "react";
import { FC, useLayoutEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
// @ts-ignore
import { useResizeObserver } from "./hooks.ts";

const Container = styled.div`
  position: relative;
`;

const Text = styled.h4`
  position: relative;
  text-align: center;
  font-size: 1.5rem;
  padding: 0 0 2rem 0;
  line-height: 2em;
  cursor: text;

  ::selection {
    background: transparent;
  }
`;

const blink = keyframes`
  0%   { opacity: 1 }
  50%  { opacity: 1 }
  55%  { opacity: 0 }
  100% { opacity: 0 }
`;

const Cursor = styled.rect<{ collapsed: boolean }>`
  fill: ${props => (props.collapsed ? "#0023FF" : "rgba(0, 52, 255, 0.25)")};
  ${props =>
    props.collapsed
      ? css`
          animation: ${blink} 1.2s infinite ease-out;
        `
      : ""}
`;

const SelectedOffset = styled.rect`
  fill: #0023ff;
`;

const PositionalInfo = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  user-select: none;
  font-family: monospace;
  font-size: 16px;
  mix-blend-mode: multiply;
  width: 100%;
  height: 100%;
`;

export const CharacterOffsetViewer: FC<{
  rtl?: boolean;
  children: string;
}> = props => {
  let ref = useRef<HTMLHeadingElement | null>(null);
  let [positions, setPositions] = useState<
    Array<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>
  >([]);
  let [offsetDims, setOffsetDims] = useState<
    Array<{
      width: number;
      height: number;
    }>
  >([]);
  let [cursor, setCursor] = useState([-1, -1]);

  useLayoutEffect(() => {
    let selectionDidChange = () => {
      let selection = document.getSelection();
      if (selection && ref.current) {
        let range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        if (
          range &&
          (ref.current.contains(range.startContainer) ||
            ref.current === range.startContainer)
        ) {
          setCursor([range.startOffset, range.endOffset]);
          return;
        }
      }
      setCursor([-1, -1]);
    };
    document.addEventListener("selectionchange", selectionDidChange);

    return () => {
      document.removeEventListener("selectionchange", selectionDidChange);
    };
  }, [props.children]);

  useResizeObserver(
    ref,
    () => {
      let range = document.createRange();
      if (ref.current) {
        let text = ref.current.querySelector("h4")!;
        let offset = text.getBoundingClientRect();
        let textNode = text.childNodes[0] as Text;
        let characterPositions = [];
        for (let i = 0, len = textNode.length; i < len; i++) {
          range.setStart(textNode, i);
          range.setEnd(textNode, i + 1);
          let rect = range.getClientRects()[0];
          let x = rect.left - offset.left;
          if (props.rtl) {
            x += rect.width;
          }
          characterPositions.push({
            x,
            y: rect.top - offset.top + rect.height,
            width: rect.width,
            height: rect.height
          });
        }

        let lastRect = range.getClientRects()[0];
        let lastX = lastRect.left - offset.left;
        if (!props.rtl) {
          lastX += lastRect.width;
        }
        characterPositions.push({
          x: lastX,
          y: lastRect.top - offset.top + lastRect.height,
          width: 0,
          height: lastRect.height
        });

        if (props.rtl) {
          setPositions(characterPositions.reverse());
        } else {
          setPositions(characterPositions);
        }
      }
    },
    [props.children, props.rtl]
  );

  useLayoutEffect(() => {
    if (ref.current) {
      setOffsetDims(
        Array.from(ref.current.querySelectorAll("text")).map(element => {
          return element.getClientRects()[0];
        })
      );
    }
  }, [positions]);

  let endPoints: Array<{ x: number; y: number }> = [];
  let padding = 10;
  if (offsetDims.length) {
    let lhs;
    let rhs;
    // Move outwards using the center 2
    if (positions.length % 2 === 0) {
      let center = Math.floor(positions.length / 2);
      let mid = positions[center].x - positions[center].width / 2;
      lhs = {
        index: center,
        left: mid
      };
      rhs = {
        index: center - 1,
        right: mid
      };
      // Move outwards using the center
    } else {
      let center = Math.floor(positions.length / 2);
      endPoints[center] = {
        x: positions[center].x,
        y: positions[center].y + padding / 2
      };
      lhs = {
        index: center,
        left: positions[center].x - offsetDims[center].width / 2
      };
      rhs = {
        index: center,
        right: positions[center].x + offsetDims[center].width / 2 + padding
      };
    }

    while (lhs.index !== 0) {
      let before = lhs.index - 1;
      let beforeLeft = positions[before].x;
      let beforeRight = beforeLeft + offsetDims[before].width;
      let delta = Math.min(lhs.left - beforeRight, 0);

      endPoints[before] = {
        x: beforeLeft + delta,
        y: positions[before].y + padding / 2
      };
      lhs.index = before;
      lhs.left = endPoints[before].x - padding;

      let after = rhs.index + 1;
      let afterLeft = positions[after].x;
      let afterRight = afterLeft + offsetDims[after].width;
      delta = Math.max(rhs.right - afterLeft, 0);

      endPoints[after] = {
        x: afterLeft + delta,
        y: positions[after].y + padding / 2
      };
      rhs.index = after;
      rhs.right = afterRight + delta + padding;
    }
  }

  // Recenter the positions
  if (endPoints.length && positions.length) {
    let dStart = endPoints[0].x - positions[0].x;
    let end = positions.length - 1;
    let dEnd = positions[end].x - endPoints[end].x;
    let delta = (dEnd - dStart) / 2;

    if (delta !== 0) {
      endPoints = endPoints.map(({ x, y }) => ({
        x: x + delta,
        y
      }));
    }
  }

  if (props.rtl && cursor[0] !== -1) {
    let [start, end] = cursor;
    let length = [...props.children].length;
    cursor = [length - end, length - start];
  }

  cursor[1] = Math.min(cursor[1], props.children.length);
  if (cursor[1] < cursor[0]) {
    cursor = [cursor[1], cursor[0]];
  }

  return (
    <Container ref={ref}>
      <PositionalInfo>
        {cursor[0] > -1 && (
          <Cursor
            collapsed={cursor[0] === cursor[1]}
            x={positions[cursor[0]].x - 1}
            y={positions[cursor[0]].y - positions[cursor[0]].height}
            width={positions[cursor[1]].x - positions[cursor[0]].x + 2}
            height={positions[cursor[0]].height}
          />
        )}
        {cursor[0] > -1 && (
          <SelectedOffset
            x={
              endPoints[cursor[0]].x -
              offsetDims[cursor[0]].width / 2 -
              padding / 2
            }
            y={endPoints[cursor[0]].y + 3}
            width={
              endPoints[cursor[1]].x +
              offsetDims[cursor[1]].width / 2 -
              (endPoints[cursor[0]].x - offsetDims[cursor[0]].width / 2) +
              padding
            }
            height={offsetDims[cursor[0]].height + 2}
            rx={offsetDims[cursor[0]].height / 2 + 1}
          />
        )}
        {positions.map(({ x, y }, index) => {
          let offset = positions.length / 2 - index;
          let endPos = endPoints[index] || { x: x - offset * 5, y };
          let dim = offsetDims[index] || {
            width: index < 10 ? 9 : 18,
            height: 12
          };
          let isActive = index >= cursor[0] && index <= cursor[1];

          return (
            <g key={index}>
              <path
                d={`M ${x},${y - 1} L ${x},${y} C ${x},${y + 5} ${
                  endPos.x
                },${y + 5} ${endPos.x},${y + 10}`}
                stroke="#0023FF"
                strokeWidth={isActive ? 2 : 1}
                fill="none"
              />
              <text
                x={endPos.x - dim.width / 2}
                y={endPos.y + dim.height}
                fill={isActive ? "white" : "#111"}
              >
                {props.rtl ? positions.length - index - 1 : index}
              </text>
            </g>
          );
        })}
      </PositionalInfo>
      <Text dir={props.rtl ? "rtl" : "ltr"}>{props.children}</Text>
    </Container>
  );
};
