import { AttributesOf } from "@atjson/document";
import OffsetSource, { GiphyEmbed } from "@atjson/offset-annotations";
import Renderer, { ReactRendererProvider } from "@atjson/renderer-react";
import URLSource from "@atjson/source-url";
import * as React from "react";
import { FC, useState } from "react";
import styled from "styled-components";
import { TextField } from "./TextField";

const Wrapper = styled.div`
  margin: 0 auto;
  text-align: center;
  display: grid;
  grid-gap: 1rem;
`;

function without<T>(array: T[], value: T): T[] {
  let result: T[] = [];
  return array.reduce((presentParts, part) => {
    if (part !== value) {
      presentParts.push(part);
    }
    return presentParts;
  }, result);
}

const Giphy: FC<AttributesOf<GiphyEmbed>> = (props) => {
  let url = new URL(props.url);
  let giphyId = without<string>(url.pathname.split("/"), "")[1]
    .split("-")
    .slice(-1)[0];
  return (
    <picture>
      <source
        type="webp"
        src={`https://media.giphy.com/media/${giphyId}/giphy.webp`}
      />
      <img src={`https://media.giphy.com/media/${giphyId}/giphy.gif`} />
    </picture>
  );
};

export const URLPaste: FC = () => {
  let [url, setURL] = useState(
    "https://giphy.com/gifs/cover-yorker-7kQgG9mngOlJS"
  );
  return (
    <Wrapper>
      <TextField
        type="url"
        value={url}
        onChange={(evt) => setURL(evt.target.value)}
      />
      <ReactRendererProvider
        value={{ GiphyEmbed: Giphy, Default: React.Fragment }}
      >
        {Renderer.render(URLSource.fromRaw(url).convertTo(OffsetSource))}
      </ReactRendererProvider>
    </Wrapper>
  );
};
