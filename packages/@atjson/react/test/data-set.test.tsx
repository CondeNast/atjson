import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import Text, { ComponentProvider, Slice, useDataSet } from "../src";

describe("useDataSet", () => {
  test("referencing a dataset", () => {
    expect(
      ReactDOMServer.renderToStaticMarkup(
        <ComponentProvider
          value={{
            blocks: {
              foos({ dataSet }) {
                let values = useDataSet(dataSet);
                if (!values) return null;
                return values.records.map(({ foo }, index) => (
                  <React.Fragment key={index}>
                    foo: <Slice value={foo?.slice} />
                  </React.Fragment>
                ));
              },
            },
            marks: {},
          }}
        >
          <Text
            value={{
              text: "\uFFFC\uFFFChello",
              blocks: [
                {
                  id: "B1",
                  type: "foos",
                  parents: [],
                  selfClosing: true,
                  attributes: {
                    dataSet: "B0",
                  },
                },
                {
                  id: "B0",
                  type: "data-set",
                  parents: [],
                  selfClosing: true,
                  attributes: {
                    name: "test",
                    schema: { foo: "peritext" },
                    records: [{ foo: { slice: "M0", jsonValue: "hello" } }],
                  },
                },
              ],
              marks: [
                {
                  id: "M0",
                  type: "slice",
                  range: "[2..7]",
                  attributes: {},
                },
              ],
            }}
          />
        </ComponentProvider>
      )
    ).toMatchInlineSnapshot(`"foo: hello"`);
  });
});
