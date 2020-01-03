import OffsetSource, {
  Bold,
  CaptionSource,
  GiphyEmbed,
  IframeEmbed,
  Italic,
  LineBreak,
  Link,
  YouTubeEmbed
} from "@atjson/offset-annotations";
import * as React from "react";
import { FC } from "react";
import * as ReactDOMServer from "react-dom/server";
import ReactRenderer, { AttributesOf } from "../src";

function renderDocument(
  doc: OffsetSource,
  components: { [key: string]: React.StatelessComponent<any> }
) {
  return ReactDOMServer.renderToStaticMarkup(
    ReactRenderer.render(doc, components)
  );
}

const RootComponent: FC<{}> = props => {
  return <article>{props.children}</article>;
};

const BoldComponent: FC<{}> = props => {
  return <strong>{props.children}</strong>;
};

const ItalicComponent: FC<{}> = props => {
  return <em>{props.children}</em>;
};

const LinkComponent: FC<AttributesOf<Link>> = props => {
  return (
    <a
      href={props.url}
      target="__blank"
      rel="noreferrer noopener"
      title={props.title}
    >
      {props.children}
    </a>
  );
};

const LineBreakComponent: FC<{}> = () => {
  return <br />;
};

const GiphyEmbedComponent: FC<AttributesOf<GiphyEmbed>> = props => {
  let match = props.url.match(/\/gifs\/(.*)-([^-]*)/);
  if (match) {
    return <img src={`https://media.giphy.com/media/${match[2]}/giphy.gif`} />;
  }
  return <s>Sorry</s>;
};

const YouTubeEmbedComponent: FC<AttributesOf<YouTubeEmbed>> = props => {
  return (
    <iframe
      width="560"
      height="315"
      src={props.url}
      frameBorder={0}
      allowFullScreen={true}
    ></iframe>
  );
};

const IframeComponent: FC<AttributesOf<IframeEmbed>> = props => {
  return (
    <figure>
      <iframe src={props.url} />
      <figcaption>{props.caption}</figcaption>
    </figure>
  );
};

describe("ReactRenderer", () => {
  it("renders simple components", () => {
    let document = new OffsetSource({
      content: "This is bold and italic text",
      annotations: [
        new Bold({ start: 8, end: 17 }),
        new Italic({ start: 12, end: 23 })
      ]
    });

    expect(
      renderDocument(document, {
        Bold: BoldComponent,
        Italic: ItalicComponent,
        Root: RootComponent
      })
    ).toBe(
      `<article>This is <strong>bold<em> and </em></strong><em>italic</em> text</article>`
    );
  });

  it("renders nested components", () => {
    let video = new YouTubeEmbed({
      start: 9,
      end: 10,
      attributes: {
        url: "https://www.youtube.com/embed/U8x85EY03vY"
      }
    });
    video.isUsingCookielessDomain = true;
    video.areControlsShown = false;
    video.isPlayerInfoShown = false;
    video.areRelatedVideosShown = false;

    let doc = new OffsetSource({
      content: "Good boy\n ",
      annotations: [
        new Link({
          start: 0,
          end: 10,
          attributes: {
            url: "https://www.youtube.com/watch?v=U8x85EY03vY"
          }
        }),
        new LineBreak({ start: 8, end: 9 }),
        video
      ]
    });

    expect(
      renderDocument(doc, {
        Bold: BoldComponent,
        Italic: ItalicComponent,
        Root: RootComponent,
        Link: LinkComponent,
        LineBreak: LineBreakComponent,
        YoutubeEmbed: YouTubeEmbedComponent
      })
    ).toBe(
      `<article><a href="https://www.youtube.com/watch?v=U8x85EY03vY" target="__blank" rel="noreferrer noopener">Good boy<br/><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/U8x85EY03vY?controls=0&amp;showinfo=0&amp;rel=0" frameBorder="0" allowfullscreen=""></iframe></a></article>`
    );
  });

  it("reuses renderers", () => {
    let doc = new OffsetSource({
      content: "Another good boy\n ",
      annotations: [
        new Link({
          start: 0,
          end: 19,
          attributes: {
            url: "https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy"
          }
        }),
        new LineBreak({ start: 16, end: 17 }),
        new GiphyEmbed({
          start: 17,
          end: 18,
          attributes: {
            url: "https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy"
          }
        })
      ]
    });

    expect(
      renderDocument(doc, {
        Root: RootComponent,
        LineBreak: LineBreakComponent,
        Link: LinkComponent,
        GiphyEmbed: GiphyEmbedComponent
      })
    ).toBe(
      `<article><a href=\"https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy\" target=\"__blank\" rel=\"noreferrer noopener\">Another good boy<br/><img src=\"https://media.giphy.com/media/26FmRLBRZfpMNwWdy/giphy.gif\"/></a></article>`
    );
  });

  describe("Subdocuments", () => {
    it("renders single-level nested subdocuments", () => {
      const subDoc = new CaptionSource({
        content: "This is some caption text",
        annotations: [
          new Bold({
            start: 0,
            end: 4
          }),
          new Italic({
            start: 8,
            end: 12
          })
        ]
      });

      let doc = new OffsetSource({
        content: "An embed with caption (￼) and some text following.",
        annotations: [
          new Bold({
            start: 3,
            end: 8
          }),
          new IframeEmbed({
            start: 23,
            end: 24,
            attributes: {
              url: "https://foo.bar",
              caption: subDoc
            }
          })
        ]
      });

      expect(
        renderDocument(doc, {
          Bold: BoldComponent,
          Italic: ItalicComponent,
          IframeEmbed: IframeComponent,
          Root: RootComponent
        })
      ).toBe(
        `<article>An <strong>embed</strong> with caption (<figure><iframe src="https://foo.bar"></iframe><figcaption><strong>This</strong> is <em>some</em> caption text</figcaption></figure>) and some text following.</article>`
      );
    });
  });
});
