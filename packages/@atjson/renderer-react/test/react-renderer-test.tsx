import OffsetSource, { Bold, GiphyEmbed, Italic, LineBreak, Link, YouTubeEmbed } from '@atjson/offset-annotations';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import ReactRenderer from '../src';

function renderDocument(doc: OffsetSource, components: { [key: string]: React.StatelessComponent<any> }) {
  return ReactDOMServer.renderToStaticMarkup(ReactRenderer.render(doc, components));
}

const RootComponent: React.StatelessComponent<{}> = props => {
  return <article>{props.children}</article>;
};

const BoldComponent: React.StatelessComponent<{}> = props => {
  return <strong>{props.children}</strong>;
};

const ItalicComponent: React.StatelessComponent<{}> = props => {
  return <em>{props.children}</em>;
};

const LinkComponent: React.StatelessComponent<{
  url: string;
  shouldOpenInNewTab: boolean;
}> = props => {
  if (props.shouldOpenInNewTab) {
    return <a href={props.url} target='__blank' rel='noreferrer noopener'>{props.children}</a>;
  }
  return <a href={props.url}>{props.children}</a>;
};

const LineBreakComponent: React.StatelessComponent<{}> = () => {
  return <br/>;
};

const GiphyEmbedComponent: React.StatelessComponent<{ url: string }> = props => {
  let id = props.url!.match(/\/gifs\/(.*)-([^-]*)/)[2];
  let src = `https://media.giphy.com/media/${id}/giphy.gif`;
  return <img src={src} />;
};

const YouTubeEmbedComponent: React.StatelessComponent<{
  url: string;
  showRelatedVideos: boolean;
  showPlayerControls: boolean;
  showInfo: boolean;
  noCookies: boolean;
}> = props => {
  let videoId = props.url!.match(/[?|&]v=([^&]*)/)[1];
  let domain = props.noCookies ? 'youtube-nocookie' : 'youtube';
  let queryParams = [];
  if (props.showRelatedVideos === false) {
    queryParams.push('rel=0');
  }
  if (props.showPlayerControls === false) {
    queryParams.push('controls=0');
  }
  if (props.showInfo === false) {
    queryParams.push('showinfo=0');
  }
  let queryString = '';
  if (queryParams.length) {
    queryString = '?' + queryParams.join('&');
  }
  let src = `https://www.${domain}.com/embed/${videoId}${queryString}`;
  return <iframe width='560' height='315' src={src} frameBorder={0} allowFullScreen={true}></iframe>;
};

describe('ReactRenderer', () => {
  it('renders simple components', () => {
    let document = new OffsetSource({
      content: 'This is bold and italic text',
      annotations: [
        new Bold({ start: 8, end: 17 }),
        new Italic({ start: 12, end: 23 })
      ]
    });

    expect(renderDocument(document, {
      Bold: BoldComponent,
      Italic: ItalicComponent,
      Root: RootComponent
    })).toBe(
      `<article>This is <strong>bold<em> and </em></strong><em>italic</em> text</article>`
    );
  });

  it('renders nested components', () => {
    let doc = new OffsetSource({
      content: 'Good boy\n ',
      annotations: [
        new Link({
          start: 0,
          end: 10,
          attributes: {
            url: 'https://www.youtube.com/watch?v=U8x85EY03vY'
          }
        }),
        new LineBreak({ start: 8, end: 9 }),
        new YouTubeEmbed({
          start: 9,
          end: 10,
          attributes: {
            url: 'https://www.youtube.com/watch?v=U8x85EY03vY',
            showRelatedVideos: false,
            showPlayerControls: false,
            showInfo: false,
            noCookies: true
          }
        })
      ]
    });

    expect(renderDocument(doc, {
      Bold: BoldComponent,
      Italic: ItalicComponent,
      Root: RootComponent,
      Link: LinkComponent,
      LineBreak: LineBreakComponent,
      YoutubeEmbed: YouTubeEmbedComponent
    })).toBe(
      `<article><a href="https://www.youtube.com/watch?v=U8x85EY03vY">Good boy<br/><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/U8x85EY03vY?rel=0&amp;controls=0&amp;showinfo=0" frameBorder="0" allowfullscreen=""></iframe></a></article>`
    );
  });

  it('reuses renderers', () => {
    let doc = new OffsetSource({
      content: 'Another good boy\n ',
      annotations: [
        new Link({
          start: 0,
          end: 19,
          attributes: {
            url: 'https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy',
            shouldOpenInNewTab: true
          }
        }),
        new LineBreak({ start: 16, end: 17 }),
        new GiphyEmbed({
          start: 17,
          end: 18,
          attributes: {
            url: 'https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy'
          }
        })
      ]
    });

    expect(renderDocument(doc, {
      Root: RootComponent,
      LineBreak: LineBreakComponent,
      Link: LinkComponent,
      GiphyEmbed: GiphyEmbedComponent
    })).toBe(
      `<article><a href=\"https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy\" target=\"__blank\" rel=\"noreferrer noopener\">Another good boy<br/><img src=\"https://media.giphy.com/media/26FmRLBRZfpMNwWdy/giphy.gif\"/></a></article>`
    );
  });
});
