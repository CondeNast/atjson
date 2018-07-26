import ReactRenderer from '@atjson/renderer-react';
import Document from '@atjson/document';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

function renderDocument(renderer: ReactRenderer, doc: Document): string {
  return ReactDOMServer.renderToStaticMarkup(renderer.render(doc));
}

describe('ReactRenderer', function () {
  it('renders simple components', function () {
    let renderer = new ReactRenderer({
      root({ children }) {
        return <article>{children}</article>
      },
      bold({ children }) {
        return <strong>{children}</strong>;
      },
      italic({ children }) {
        return <em>{children}</em>;
      }
    });

    let document = new Document({
      content: 'This is bold and italic text',
      annotations: [{
        type: 'bold', start: 8, end: 17
      }, {
        type: 'italic', start: 12, end: 23
      }]
    });

    expect(renderDocument(renderer, document)).toBe(
                 `<article>This is <strong>bold<em> and </em></strong><em>italic</em> text</article>`);
  });

  (function () {
    let renderer = new ReactRenderer({
      root({ children }) {
        return <article>{children}</article>
      },
      link({ children, href, shouldOpenInNewTab }) {
        if (shouldOpenInNewTab) {
          return <a href={href} target="__blank" rel="noreferrer noopener">{children}</a>;
        }
        return <a href={href}>{children}</a>;
      },
      newline() {
        return <br/>;
      },
      giphy({ source }) {
        let id: string = source.match(/\/gifs\/(.*)-([^-]*)/)[2];
        let src: string = `https://media.giphy.com/media/${id}/giphy.gif`;
        return <img src={src} />;
      },
      youtube({ source, showRelatedVideos, showPlayerControls, showInfo, noCookies }) {
        let videoId = source.match(/[?|&]v=([^&]*)/)[1];
        let domain = noCookies ? 'youtube-nocookie' : 'youtube';
        let queryParams = [];
        if (showRelatedVideos === false) {
          queryParams.push('rel=0');
        }
        if (showPlayerControls === false) {
          queryParams.push('controls=0');
        }
        if (showInfo === false) {
          queryParams.push('showinfo=0');
        }
        let queryString = '';
        if (queryParams.length) {
          queryString = '?' + queryParams.join('&');
        }
        let src = `https://www.${domain}.com/embed/${videoId}${queryString}`;
        return <iframe width="560" height="315" src={src} frameBorder={0} allowFullScreen={true}></iframe>;
      }
    });

    it('renders nested components', function () {
      let doc = new Document({
        content: 'Good boy\n ',
        annotations: [{
          type: 'link', start: 0, end: 10, attributes: {
            href: 'https://www.youtube.com/watch?v=U8x85EY03vY'
          }
        }, {
          type: 'newline', start: 8, end: 9
        }, {
          type: 'youtube', start: 9, end: 10, attributes: {
            source: 'https://www.youtube.com/watch?v=U8x85EY03vY',
            showPlayerControls: false,
            showRelatedVideos: false,
            showInfo: false,
            noCookies: true
          }
        }]
      });

      expect(renderDocument(renderer, doc)).toBe(
                   `<article><a href="https://www.youtube.com/watch?v=U8x85EY03vY">Good boy<br/><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/U8x85EY03vY?rel=0&amp;controls=0&amp;showinfo=0" frameBorder="0" allowfullscreen=""></iframe></a></article>`);
    });

    it('reuses renderers', function () {
      let doc = new Document({
        content: 'Another good boy\n ',
        annotations: [{
          type: 'link', start: 0, end: 19, attributes: {
            href: 'https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy',
            shouldOpenInNewTab: true
          }
        }, {
          type: 'newline', start: 16, end: 17
        }, {
          type: 'giphy', start: 17, end: 18, attributes: {
            source: 'https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy'
          }
        }]
      });

      expect(renderDocument(renderer, doc)).toBe(
                   `<article><a href=\"https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy\" target=\"__blank\" rel=\"noreferrer noopener\">Another good boy<br/><img src=\"https://media.giphy.com/media/26FmRLBRZfpMNwWdy/giphy.gif\"/></a></article>`);
    });

  }());
});
