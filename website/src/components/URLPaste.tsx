import { AttributesOf } from '@atjson/document';
import OffsetSource, { GiphyEmbed } from '@atjson/offset-annotations';
import Renderer from '@atjson/renderer-react';
import URLSource from '@atjson/source-url';
import * as React from 'react';
import { FC, useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin: 0 auto;
  text-align: center;
  display: grid;
`;

const URLField = styled.input.attrs({
  type: 'url'
})`
  font-size: 16px;
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

const Giphy: FC<AttributesOf<GiphyEmbed>> = props => {
  let url = new URL(props.url);
  let giphyId = without<string>(url.pathname.split('/'), '')[1].split('-').slice(-1)[0];
  return <img src={`https://media.giphy.com/media/${giphyId}/giphy.webp`} />;
};

export const URLPaste: FC = () => {
  let [url, setURL] = useState('https://giphy.com/gifs/cover-yorker-7kQgG9mngOlJS');
  return (
    <Wrapper>
      <URLField
        value={url}
        onChange={evt => setURL(evt.target.value)}
      />
      {
        Renderer.render(URLSource.fromRaw(url).convertTo(OffsetSource), {
          GiphyEmbed: Giphy
        })
      }
    </Wrapper>
  );
};
