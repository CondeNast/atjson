import {
  AttributesOf,
  ParseAnnotation,
  SliceAnnotation,
} from "@atjson/document";
import OffsetSource, {
  Bold,
  ColumnType,
  DataSet,
  GiphyEmbed,
  IframeEmbed,
  Italic,
  LineBreak,
  Link,
  Paragraph,
  Table,
  VideoEmbed,
  VideoURLs,
} from "@atjson/offset-annotations";
import * as React from "react";
import { createElement, Fragment, ReactNode } from "react";
import * as ReactDOMServer from "react-dom/server";
import ReactRenderer, {
  PropsOf,
  ReactRendererProvider,
  Slice,
  useDataSet,
} from "../src";

function renderDocument(
  doc: OffsetSource,
  components: { [key: string]: React.ComponentType<any> }
) {
  return ReactDOMServer.renderToStaticMarkup(
    <ReactRendererProvider value={components}>
      {ReactRenderer.render(doc)}
    </ReactRendererProvider>
  );
}

function ParagraphComponent(props: PropsOf<Paragraph>) {
  return <p>{props.children}</p>;
}

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
      <figcaption>
        {typeof props.caption === "string" ? (
          <Slice value={props.caption} fallback={props.caption} />
        ) : (
          props.caption
        )}
      </figcaption>
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
        <figcaption>
          {typeof props.caption === "string" ? (
            <Slice value={props.caption} fallback={props.caption} />
          ) : (
            props.caption
          )}
        </figcaption>
      </ReactRendererProvider>
    </figure>
  );
}

function TableComponent(props: AttributesOf<Table>) {
  let data = useDataSet(props.dataSet);

  return (
    <table>
      <tbody>
        {data?.records.map((row, index) => (
          <tr key={index}>
            {props.columns.map(({ columnName }, colIndex) => (
              <td key={`${index}-${colIndex}`}>
                <Slice value={row[columnName].slice} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
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
    let doc = new OffsetSource({
      content: "Good boy ",
      annotations: [
        new Link({
          start: 0,
          end: 8,
          attributes: {
            url: "https://www.youtube.com/watch?v=U8x85EY03vY",
          },
        }),
        new LineBreak({ start: 4, end: 5 }),
        new ParseAnnotation({ start: 4, end: 5 }),
        new VideoEmbed({
          start: 8,
          end: 9,
          attributes: {
            url: "https://www.youtube-nocookie.com/embed/U8x85EY03vY?controls=0&showinfo=0&rel=0",
            provider: VideoURLs.Provider.YOUTUBE,
          },
        }),
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
    ).toMatchInlineSnapshot(
      `"<a href="https://www.youtube.com/watch?v=U8x85EY03vY" target="__blank" rel="noreferrer noopener">Good<br/>boy</a><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/U8x85EY03vY?controls=0&amp;showinfo=0&amp;rel=0" frameBorder="0" allowFullScreen=""></iframe>"`
    );
  });

  it("renders blocks and marks", () => {
    let doc = new OffsetSource({
      content: "Text that is bold and italic",
      annotations: [
        new Paragraph({
          start: 0,
          end: 28,
        }),
        new Bold({
          start: 13,
          end: 21,
        }),
        new Italic({
          start: 18,
          end: 28,
        }),
      ],
    });

    expect(
      renderDocument(doc, {
        Paragraph: ParagraphComponent,
        Bold: BoldComponent,
        Italic: ItalicComponent,
      })
    ).toMatchInlineSnapshot(
      `"<p>Text that is <strong>bold <em>and</em></strong><em> italic</em></p>"`
    );
  });

  it("reuses renderers", () => {
    let doc = new OffsetSource({
      content: "Another good boy\uFFFC",
      annotations: [
        new Link({
          start: 0,
          end: 16,
          attributes: {
            url: "https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy",
          },
        }),
        new LineBreak({ start: 7, end: 8 }),
        new ParseAnnotation({ start: 7, end: 8 }),
        new GiphyEmbed({
          start: 16,
          end: 17,
          attributes: {
            url: "https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy",
          },
        }),
        new ParseAnnotation({ start: 16, end: 17 }),
      ],
    });

    expect(
      renderDocument(doc, {
        LineBreak: LineBreakComponent,
        Link: LinkComponent,
        GiphyEmbed: GiphyEmbedComponent,
      })
    ).toMatchInlineSnapshot(
      `"<link rel="preload" as="image" href="https://media.giphy.com/media/26FmRLBRZfpMNwWdy/giphy.gif"/><a href="https://giphy.com/gifs/dog-chair-good-boy-26FmRLBRZfpMNwWdy" target="__blank" rel="noreferrer noopener">Another<br/>good boy</a><img src="https://media.giphy.com/media/26FmRLBRZfpMNwWdy/giphy.gif"/>"`
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
          new ParseAnnotation({
            start: 22,
            end: 23,
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
          new ParseAnnotation({
            start: 22,
            end: 23,
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

  describe("useDataSet hook", () => {
    it("can be used to render tables", () => {
      const doc = new OffsetSource({
        content: "foo bar baz",
        annotations: [
          new DataSet({
            id: "DS1",
            start: 0,
            end: 11,
            attributes: {
              records: [
                {
                  foo: { slice: "S1", jsonValue: "foo" },
                  bar: { slice: "S2", jsonValue: "bar" },
                  baz: { slice: "S3", jsonValue: "baz" },
                },
              ],
              schema: {
                foo: ColumnType.STRING,
                bar: ColumnType.STRING,
                baz: ColumnType.STRING,
              },
            },
          }),
          new Table({
            start: 0,
            end: 11,
            attributes: {
              dataSet: "DS1",
              columns: [
                { columnName: "foo" },
                { columnName: "bar" },
                { columnName: "baz" },
              ],
            },
          }),
          new SliceAnnotation({
            id: "S1",
            start: 0,
            end: 3,
          }),
          new SliceAnnotation({
            id: "S2",
            start: 4,
            end: 7,
          }),
          new SliceAnnotation({
            id: "S3",
            start: 8,
            end: 11,
          }),
        ],
      });

      expect(
        renderDocument(doc, {
          Table: TableComponent,
        })
      ).toBe(
        "<table><tbody><tr><td>foo</td><td>bar</td><td>baz</td></tr></tbody></table>"
      );
    });
  });
});
