import OffsetSource, {
  Bold,
  CaptionSource,
  GiphyEmbed,
  IframeEmbed,
  Italic,
  LineBreak,
  Link,
  VideoEmbed
} from "@atjson/schema-offset";
import * as React from "react";
import { FC } from "react";
import * as ReactDOMServer from "react-dom/server";
import ReactRenderer, { AttributesOf, ReactRendererProvider } from "../src";

function renderDocument(
  doc: OffsetSource,
  components: { [key: string]: React.StatelessComponent<any> }
) {
  return ReactDOMServer.renderToStaticMarkup(
    <ReactRendererProvider value={components}>
      {ReactRenderer.render(doc)}
    </ReactRendererProvider>
  );
}

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

const VideoEmbedComponent: FC<AttributesOf<VideoEmbed>> = props => {
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

const CaptionBold: FC<{}> = props => {
  return <b>{props.children}</b>;
};

const IframeComponentWithProvider: FC<AttributesOf<IframeEmbed>> = props => {
  return (
    <figure>
      <iframe src={props.url} />
      <ReactRendererProvider value={{ Bold: CaptionBold }}>
        <figcaption>{props.caption}</figcaption>
      </ReactRendererProvider>
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
        Italic: ItalicComponent
      })
    ).toBe(`This is <strong>bold<em> and </em></strong><em>italic</em> text`);
  });

  it("renders nested components", () => {
    let video = new VideoEmbed({
      start: 9,
      end: 10,
      attributes: {
        url:
          "https://www.youtube-nocookie.com/embed/U8x85EY03vY?controls=0&showinfo=0&rel=0"
      }
    });

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
        Link: LinkComponent,
        LineBreak: LineBreakComponent,
        VideoEmbed: VideoEmbedComponent
      })
    ).toBe(
      `<a href="https://www.youtube.com/watch?v=U8x85EY03vY" target="__blank" rel="noreferrer noopener">Good boy<br/><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/U8x85EY03vY?controls=0&amp;showinfo=0&amp;rel=0" frameBorder="0" allowfullscreen=""></iframe></a>`
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
        LineBreak: LineBreakComponent,
        Link: LinkComponent,
        GiphyEmbed: GiphyEmbedComponent
      })
    ).toBe(
      `<a href=\"https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy\" target=\"__blank\" rel=\"noreferrer noopener\">Another good boy<br/><img src=\"https://media.giphy.com/media/26FmRLBRZfpMNwWdy/giphy.gif\"/></a>`
    );
  });

  it("errors when no provider present", () => {
    let document = new OffsetSource({
      content: "This is bold text",
      annotations: [new Bold({ start: 8, end: 12 })]
    });

    expect(() =>
      ReactDOMServer.renderToStaticMarkup(ReactRenderer.render(document))
    ).toThrowError(/ReactRendererProvider/);
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
          IframeEmbed: IframeComponent
        })
      ).toBe(
        `An <strong>embed</strong> with caption (<figure><iframe src="https://foo.bar"></iframe><figcaption><strong>This</strong> is <em>some</em> caption text</figcaption></figure>) and some text following.`
      );
    });

    it("Accepts alternate components via a provider", () => {
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
          IframeEmbed: IframeComponentWithProvider
        })
      ).toBe(
        `An <strong>embed</strong> with caption (<figure><iframe src="https://foo.bar"></iframe><figcaption><b>This</b> is <em>some</em> caption text</figcaption></figure>) and some text following.`
      );
    });
  });
});
