import styled from "styled-components";

export const TextField = styled.input`
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

  :hover {
    border-color: #0036ff;
  }

  :focus {
    outline: none;
    border-color: #0036ff;
    box-shadow: 0 0 0 2px #0036ff33;
  }
`;
