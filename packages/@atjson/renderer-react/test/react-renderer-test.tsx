import { ObjectAnnotation, SliceAnnotation } from "@atjson/document";
import OffsetSource, {
  Bold,
  CaptionSource,
  GiphyEmbed,
  IframeEmbed,
  Italic,
  LineBreak,
  Link,
  VideoEmbed,
  VideoURLs,
} from "@atjson/offset-annotations";
import * as React from "react";
import { createElement, Fragment, ReactNode } from "react";
import * as ReactDOMServer from "react-dom/server";
import ReactRenderer, { PropsOf, ReactRendererProvider } from "../src";

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

class IframeEmbedWithSubdocument extends ObjectAnnotation<{
  url: string;
  width?: string;
  height?: string;
  caption?: CaptionSource;
  sandbox?: string;
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "iframe-embed-with-subdocument";
  static vendorPrefix = "offset";
  static subdocuments = { caption: CaptionSource };

  get url() {
    try {
      return new URL(this.attributes.url);
    } catch (e) {
      return null;
    }
  }
}
OffsetSource.schema.push(IframeEmbedWithSubdocument);

function BoldComponent(props: PropsOf<Bold>) {
  return <strong>{props.children}</strong>;
}

function ItalicComponent(props: { children: ReactNode }) {
  return <em>{props.children}</em>;
}

function LinkComponent(props: PropsOf<Link>) {
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
}

function LineBreakComponent() {
  return <br />;
}

function GiphyEmbedComponent(props: PropsOf<GiphyEmbed>) {
  let match = props.url.match(/\/gifs\/(.*)-([^-]*)/);
  if (match) {
    return <img src={`https://media.giphy.com/media/${match[2]}/giphy.gif`} />;
  }
  return <s>Sorry</s>;
}

function VideoEmbedComponent(props: PropsOf<VideoEmbed>) {
  return (
    <iframe
      width="560"
      height="315"
      src={props.url}
      frameBorder={0}
      allowFullScreen={true}
    ></iframe>
  );
}

function IframeComponent(props: PropsOf<IframeEmbed>) {
  return (
    <figure>
      <iframe src={props.url} />
      <figcaption>{props.caption}</figcaption>
    </figure>
  );
}

function CaptionBold(props: { children: ReactNode }) {
  return <b>{props.children}</b>;
}

function IframeComponentWithProvider(props: PropsOf<IframeEmbed>) {
  return (
    <figure>
      <iframe src={props.url} />
      <ReactRendererProvider value={{ Bold: CaptionBold }}>
        <figcaption>{props.caption}</figcaption>
      </ReactRendererProvider>
    </figure>
  );
}

describe("ReactRenderer", () => {
  it("renders simple components", () => {
    let document = new OffsetSource({
      content: "This is bold and italic text",
      annotations: [
        new Bold({ start: 8, end: 17 }),
        new Italic({ start: 12, end: 23 }),
      ],
    });

    expect(
      renderDocument(document, {
        Bold: BoldComponent,
        Italic: ItalicComponent,
      })
    ).toBe(`This is <strong>bold<em> and </em></strong><em>italic</em> text`);
  });

  it("renders nested components", () => {
    let video = new VideoEmbed({
      start: 9,
      end: 10,
      attributes: {
        url: "https://www.youtube-nocookie.com/embed/U8x85EY03vY?controls=0&showinfo=0&rel=0",
        provider: VideoURLs.Provider.YOUTUBE,
      },
    });

    let doc = new OffsetSource({
      content: "Good boy\n ",
      annotations: [
        new Link({
          start: 0,
          end: 10,
          attributes: {
            url: "https://www.youtube.com/watch?v=U8x85EY03vY",
          },
        }),
        new LineBreak({ start: 8, end: 9 }),
        video,
      ],
    });

    expect(
      renderDocument(doc, {
        Bold: BoldComponent,
        Italic: ItalicComponent,
        Link: LinkComponent,
        LineBreak: LineBreakComponent,
        VideoEmbed: VideoEmbedComponent,
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
            url: "https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy",
          },
        }),
        new LineBreak({ start: 16, end: 17 }),
        new GiphyEmbed({
          start: 17,
          end: 18,
          attributes: {
            url: "https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy",
          },
        }),
      ],
    });

    expect(
      renderDocument(doc, {
        LineBreak: LineBreakComponent,
        Link: LinkComponent,
        GiphyEmbed: GiphyEmbedComponent,
      })
    ).toBe(
      `<a href=\"https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy\" target=\"__blank\" rel=\"noreferrer noopener\">Another good boy<br/><img src=\"https://media.giphy.com/media/26FmRLBRZfpMNwWdy/giphy.gif\"/></a>`
    );
  });

  it("errors when no provider present", () => {
    let document = new OffsetSource({
      content: "This is bold text",
      annotations: [new Bold({ start: 8, end: 12 })],
    });

    expect(() =>
      ReactDOMServer.renderToStaticMarkup(
        createElement(Fragment, {}, ReactRenderer.render(document))
      )
    ).toThrowError(/ReactRendererProvider/);
  });

  describe("Slices", () => {
    it("renders single-level nested subdocuments", () => {
      let doc = new OffsetSource({
        content:
          "An embed with caption ￼(This is some caption text) and some text following.",
        annotations: [
          new Bold({
            start: 3,
            end: 8,
          }),
          new IframeEmbed({
            id: "iframe-1",
            start: 22,
            end: 23,
            attributes: {
              url: "https://foo.bar",
              caption: "slice-1",
            },
          }),
          new SliceAnnotation({
            id: "slice-1",
            start: 23,
            end: 50,
            attributes: {
              refs: ["iframe-1"],
            },
          }),
          new Bold({
            start: 24,
            end: 28,
          }),
          new Italic({
            start: 32,
            end: 36,
          }),
        ],
      });

      expect(
        renderDocument(doc, {
          Bold: BoldComponent,
          Italic: ItalicComponent,
          IframeEmbed: IframeComponent,
        })
      ).toBe(
        `An <strong>embed</strong> with caption <figure><iframe src="https://foo.bar"></iframe><figcaption>(<strong>This</strong> is <em>some</em> caption text)</figcaption></figure> and some text following.`
      );
    });

    it("Accepts alternate components via a provider", () => {
      let doc = new OffsetSource({
        content:
          "An embed with caption ￼(This is some caption text) and some text following.",
        annotations: [
          new Bold({
            start: 3,
            end: 8,
          }),
          new IframeEmbed({
            id: "iframe-1",
            start: 22,
            end: 23,
            attributes: {
              url: "https://foo.bar",
              caption: "slice-1",
            },
          }),
          new SliceAnnotation({
            id: "slice-1",
            start: 23,
            end: 50,
            attributes: {
              refs: ["iframe-1"],
            },
          }),
          new Bold({
            start: 24,
            end: 28,
          }),
          new Italic({
            start: 32,
            end: 36,
          }),
        ],
      });

      expect(
        renderDocument(doc, {
          Bold: BoldComponent,
          Italic: ItalicComponent,
          IframeEmbed: IframeComponentWithProvider,
        })
      ).toBe(
        `An <strong>embed</strong> with caption <figure><iframe src="https://foo.bar"></iframe><figcaption>(<b>This</b> is <em>some</em> caption text)</figcaption></figure> and some text following.`
      );
    });
  });

  describe("Subdocuments", () => {
    it("renders single-level nested subdocuments", () => {
      const subDoc = new CaptionSource({
        content: "This is some caption text",
        annotations: [
          new Bold({
            start: 0,
            end: 4,
          }),
          new Italic({
            start: 8,
            end: 12,
          }),
        ],
      });

      let doc = new OffsetSource({
        content: "An embed with caption (￼) and some text following.",
        annotations: [
          new Bold({
            start: 3,
            end: 8,
          }),
          new IframeEmbedWithSubdocument({
            start: 23,
            end: 24,
            attributes: {
              url: "https://foo.bar",
              caption: subDoc,
            },
          }),
        ],
      });

      expect(
        renderDocument(doc, {
          Bold: BoldComponent,
          Italic: ItalicComponent,
          IframeEmbedWithSubdocument: IframeComponent,
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
            end: 4,
          }),
          new Italic({
            start: 8,
            end: 12,
          }),
        ],
      });

      let doc = new OffsetSource({
        content: "An embed with caption (￼) and some text following.",
        annotations: [
          new Bold({
            start: 3,
            end: 8,
          }),
          new IframeEmbedWithSubdocument({
            start: 23,
            end: 24,
            attributes: {
              url: "https://foo.bar",
              caption: subDoc,
            },
          }),
        ],
      });

      expect(
        renderDocument(doc, {
          Bold: BoldComponent,
          Italic: ItalicComponent,
          IframeEmbedWithSubdocument: IframeComponentWithProvider,
        })
      ).toBe(
        `An <strong>embed</strong> with caption (<figure><iframe src="https://foo.bar"></iframe><figcaption><b>This</b> is <em>some</em> caption text</figcaption></figure>) and some text following.`
      );
    });
  });
});
