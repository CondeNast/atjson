import Document, { AttributesOf, InlineAnnotation } from '@atjson/document';
import Renderer from '@atjson/renderer-react';
import * as React from 'react';
import { FC } from 'react';
import styled from 'styled-components';

const Wrapper = styled.h4`
  text-align: center;
`;

export class Adjective extends InlineAnnotation {
  static vendorPrefix = 'qbf';
  static type = 'adjective';
}

export class Noun extends InlineAnnotation {
  static vendorPrefix = 'qbf';
  static type = 'noun';
}

export class Image extends InlineAnnotation<{
  src: string;
}> {
  static vendorPrefix = 'qbf';
  static type = 'image';
}

export class Italic extends InlineAnnotation {
  static vendorPrefix = 'qbf';
  static type = 'italic';
}

export class TextColor extends InlineAnnotation<{
  color: string;
}> {
  static vendorPrefix = 'qbf';
  static type = 'text-color';
}

export class Verb extends InlineAnnotation {
  static vendorPrefix = 'qbf';
  static type = 'verb';
}

export class QuickBrownFoxSource extends Document {
  static contentType = 'application/vnd.atjson+quick-brown-fox';
  static schema = [
    Adjective,
    Noun,
    Image,
    Italic,
    TextColor,
    Verb
  ];
}

const ItalicComponent: FC<AttributesOf<Italic>> = props => {
  return <em>{props.children}</em>;
};

const TextColorComponent: FC<AttributesOf<TextColor>> = props => {
  return <span style={{ color: props.color }}>{props.children}</span>;
};

export const QuickBrownFox: FC<{
  value: QuickBrownFoxSource
}> = props => {
  // We're going to render the rest of the annotations
  // off in a separate set of DOM so we can have them
  // overlap in a way that is otherwise impossible for DOM
  return (
    <Wrapper>{
      Renderer.render(props.value, {
        Italic: ItalicComponent,
        TextColor: TextColorComponent
      })
    }</Wrapper>
  );
};
