import styled from "styled-components";

export const Button = styled.button`
  /** Reset */
  appearance: none;
  border: 0;
  text-decoration: none;
  &::-moz-focus-inner {
    border: 0;
  }
  color: #fff;
  background: #3d5afe;
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 16px;
  border-radius: 4px;
  padding: 4px 8px;
  box-sizing: border-box;
  transition-property: border-color, color, box-shadow;
  transition-duration: 120ms;
  transition-timing-function: ease-in-out;

  &:disabled {
    background: #dcdcdc;
    color: #8b8b8b;
  }

  :not(:disabled):hover {
    border-color: #0036ff;
  }

  :focus {
    outline: none;
    box-shadow: 0 0 0 2px #0036ff33;
  }
`;
