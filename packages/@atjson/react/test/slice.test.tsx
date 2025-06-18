import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import Text, { ComponentProvider, Slice } from "../src";

function classify(type: string) {
  return (
    type[0].toUpperCase() +
    type.slice(1).replace(/-([a-z])/g, (_, letter) => {
      return letter.toUpperCase();
    })
  );
}

describe("slice", () => {
  test("single reference", () => {
    function Photo(props: { alt: string; url: string; caption?: string }) {
      return (
        <figure>
          <img src={props.url} alt={props.alt} />
          <figcaption>
            <Slice value={props.caption} />
          </figcaption>
        </figure>
      );
    }

    expect(
      ReactDOMServer.renderToStaticMarkup(
        <ComponentProvider
          value={{
            keyOf(annotation) {
              return classify(annotation.type);
            },
            blocks: { Photo },
            marks: {},
          }}
        >
          <Text
            value={{
              text: "\uFFFCMeowwww",
              blocks: [
                {
                  id: "B0",
                  type: "photo",
                  parents: [],
                  selfClosing: false,
                  attributes: {
                    alt: "Cat coming out of a TV in a reference to “The Ring”",
                    caption: "M0",
                    url: "https://i.kym-cdn.com/photos/images/newsfeed/001/233/590/acd.jpg",
                  },
                },
              ],

              marks: [
                {
                  id: "M0",
                  type: "slice",
                  range: "[1..8]",
                  attributes: {},
                },
              ],
            }}
          />
        </ComponentProvider>,
      ),
    ).toMatchInlineSnapshot(
      `"<figure><img src="https://i.kym-cdn.com/photos/images/newsfeed/001/233/590/acd.jpg" alt="Cat coming out of a TV in a reference to “The Ring”"/><figcaption>Meowwww</figcaption></figure>"`,
    );
  });
});
