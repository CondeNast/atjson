import * as React from "react";
import { ComponentProps, FC, useLayoutEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";

export const StyledTextArea = styled.textarea<{ autoResize?: boolean }>`
  font-family: var(--ifm-font-family-base);
  font-size: 16px;
  width: 100%;
  padding: 0.5rem 1rem;
  appearance: none;
  border-radius: 4px;
  border: 1px solid #dbdee0;
  background-repeat: no-repeat;
  background-position: 0.5em 0.5em;
  background-size: 1.5em;
  box-sizing: border-box;
  transition-property: border-color, color, box-shadow;
  transition-duration: 120ms;
  transition-timing-function: ease-in-out;
  ${(props) =>
    props.autoResize
      ? css`
          resize: none;
        `
      : ""}: hover {
    border-color: #0036ff;
  }

  :focus {
    outline: none;
    border: 2px solid #0036ff;
    box-shadow: 0 0 0 2px #0036ff33;
    padding: calc(0.5rem - 1px) calc(1rem - 1px);
  }
`;

export const TextArea: FC<
  ComponentProps<"textarea"> & {
    autoResize?: boolean;
  }
> = (props) => {
  let { ref, ...attrs } = props;
  let [padding, setPadding] = useState(0);
  let textarea = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    let $ = textarea.current;
    if (props.autoResize) {
      if ($) {
        let style = window.getComputedStyle($);
        setPadding(parseInt(style.paddingTop || "0", 10));
      }
    }
  }, [props.autoResize]);

  useLayoutEffect(() => {
    if (props.autoResize) {
      let $ = textarea.current;
      if ($) {
        $.style.height = "0px";
        $.style.height = `${$.scrollHeight + padding}px`;
      }
    }
  });

  return <StyledTextArea {...attrs} ref={textarea}></StyledTextArea>;
};
