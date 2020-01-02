import OffsetSource, {
  Bold,
  CaptionSource,
  Italic,
  IframeEmbed
} from "@atjson/offset-annotations";
import * as React from "react";
import { FC } from "react";
import * as ReactDOMServer from "react-dom/server";
import ReactRenderer from "../src";

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

const IframeComponent: FC<{}> = props => {
  return (
    <figure>
      <iframe src={props.url} />
      <figcaption>{props.caption}</figcaption>
    </figure>
  );
};

describe("ReactRenderer", () => {
  it("renders nested subdocuments", () => {
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
