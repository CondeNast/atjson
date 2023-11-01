import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import Text, { ComponentProvider } from "../src";

function classify(type: string) {
  return (
    type[0].toUpperCase() +
    type.slice(1).replace(/-([a-z])/g, (_, letter) => {
      return letter.toUpperCase();
    })
  );
}

describe("children", () => {
  test("count", () => {
    function ListItem(props: React.PropsWithChildren) {
      return <li>{props.children}</li>;
    }

    function List(props: React.PropsWithChildren) {
      expect(React.Children.count(props.children)).toBe(4);
      return <ul>{props.children}</ul>;
    }

    expect(
      ReactDOMServer.renderToStaticMarkup(
        <ComponentProvider
          value={{
            keyOf(annotation) {
              return classify(annotation.type);
            },
            blocks: { List, ListItem },
            marks: {},
          }}
        >
          <Text
            value={{
              text: "\uFFFC\uFFFCOne fish\uFFFCTwo fish\uFFFCRed fish\uFFFCBlue fish",
              blocks: [
                {
                  id: "B0",
                  type: "list",
                  parents: [],
                  selfClosing: false,
                  attributes: {},
                },
                {
                  id: "B1",
                  type: "list-item",
                  parents: ["list"],
                  selfClosing: false,
                  attributes: {},
                },
                {
                  id: "B2",
                  type: "list-item",
                  parents: ["list"],
                  selfClosing: false,
                  attributes: {},
                },
                {
                  id: "B3",
                  type: "list-item",
                  parents: ["list"],
                  selfClosing: false,
                  attributes: {},
                },
                {
                  id: "B4",
                  type: "list-item",
                  parents: ["list"],
                  selfClosing: false,
                  attributes: {},
                },
              ],

              marks: [],
            }}
          />
        </ComponentProvider>
      )
    ).toMatchInlineSnapshot(
      `"<ul><li>One fish</li><li>Two fish</li><li>Red fish</li><li>Blue fish</li></ul>"`
    );
  });

  test("map", () => {
    function List(props: React.PropsWithChildren) {
      expect(React.Children.count(props.children)).toBe(4);
      return (
        <ul>
          {React.Children.map(props.children, (child) => {
            return <li>{child} fish</li>;
          })}
        </ul>
      );
    }

    expect(
      ReactDOMServer.renderToStaticMarkup(
        <ComponentProvider
          value={{
            keyOf(annotation) {
              return classify(annotation.type);
            },
            blocks: { List },
            marks: {},
          }}
        >
          <Text
            value={{
              text: "\uFFFC\uFFFCOne\uFFFCTwo\uFFFCRed\uFFFCBlue",
              blocks: [
                {
                  id: "B0",
                  type: "list",
                  parents: [],
                  selfClosing: false,
                  attributes: {},
                },
                {
                  id: "B1",
                  type: "list-item",
                  parents: ["list"],
                  selfClosing: false,
                  attributes: {},
                },
                {
                  id: "B2",
                  type: "list-item",
                  parents: ["list"],
                  selfClosing: false,
                  attributes: {},
                },
                {
                  id: "B3",
                  type: "list-item",
                  parents: ["list"],
                  selfClosing: false,
                  attributes: {},
                },
                {
                  id: "B4",
                  type: "list-item",
                  parents: ["list"],
                  selfClosing: false,
                  attributes: {},
                },
              ],

              marks: [],
            }}
          />
        </ComponentProvider>
      )
    ).toMatchInlineSnapshot(
      `"<ul><li>One fish</li><li>Two fish</li><li>Red fish</li><li>Blue fish</li></ul>"`
    );
  });
});
