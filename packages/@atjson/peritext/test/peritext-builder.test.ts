/* eslint-disable max-classes-per-file */
import { BlockAnnotation, InlineAnnotation } from "@atjson/document";
import {
  block,
  mark,
  concat,
  insertAfter,
  insertBefore,
  getDescendants,
  getChildren,
  groupChildren,
  stabilizeIds,
  slice,
  Peritext,
} from "../src";

class Container extends BlockAnnotation {
  static vendorPrefix = "test";
  static type = "container";
}

class Leaf extends BlockAnnotation {
  static vendorPrefix = "test";
  static type = "leaf";
}

class Emphasis extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "emphasis";
}

function getBlocksByIds(doc: Peritext, ...ids: string[]) {
  return doc.blocks.filter((block) => ids.includes(block.id));
}

describe("peritext builder library", () => {
  describe("stabilizeIds()", () => {
    test("logically identical documents get identical ids", () => {
      const doc1 = block(Container, {}, [
        block(Leaf, {}, mark(Emphasis, {}, "text")),
        block(Leaf, {}),
      ]).peritext();
      const doc2 = block(Container, {}, [
        block(Leaf, {}, mark(Emphasis, {}, "text")),
        block(Leaf, {}),
      ]).peritext();

      expect(doc1).not.toMatchObject(doc2);
      expect(stabilizeIds(doc1)).toMatchObject(stabilizeIds(doc2));
    });

    test("idempotency", () => {
      expect(
        stabilizeIds(
          stabilizeIds(
            block(Container, {}, [
              block(Leaf, {}, mark(Emphasis, {}, "text")),
              block(Leaf, {}),
            ])
          )
        )
      ).toMatchObject(
        stabilizeIds(
          block(Container, {}, [
            block(Leaf, {}, mark(Emphasis, {}, "text")),
            block(Leaf, {}),
          ])
        )
      );
    });
  });

  describe("block()", () => {
    test("string children", () => {
      expect(stabilizeIds(block(Leaf, {}, "test"))).toMatchObject(
        stabilizeIds({
          text: "\uFFFCtest",
          blocks: [
            {
              id: "1",
              type: "leaf",
              attributes: {},
              parents: [],
            },
          ],
          marks: [],
        })
      );
    });
    test("peritext children", () => {
      expect(
        stabilizeIds(block(Container, { level: 1 }, block(Leaf, {}, "test")))
      ).toMatchObject(
        stabilizeIds({
          text: "\uFFFC\uFFFCtest",
          blocks: [
            {
              id: "0",
              type: "container",
              attributes: { level: 1 },
              parents: [],
            },
            {
              id: "1",
              type: "leaf",
              attributes: {},
              parents: ["container"],
            },
          ],
          marks: [],
        })
      );
    });
    test("peritext[] children", () => {
      expect(
        stabilizeIds(
          block(Container, { level: 1 }, [
            block(Leaf, {}, "test"),
            block(Leaf, {}, "test"),
          ])
        )
      ).toMatchObject(
        stabilizeIds({
          text: "\uFFFC\uFFFCtest\uFFFCtest",
          blocks: [
            {
              id: "0",
              type: "container",
              attributes: { level: 1 },
              parents: [],
            },
            {
              id: "1",
              type: "leaf",
              attributes: {},
              parents: ["container"],
            },
            {
              id: "2",
              type: "leaf",
              attributes: {},
              parents: ["container"],
            },
          ],
          marks: [],
        })
      );
    });
    test("mixed children", () => {
      expect(
        stabilizeIds(
          block(Container, { level: 1 }, [
            "first",
            block(Leaf, {}, "nested"),
            mark(Emphasis, {}, "last"),
          ])
        )
      ).toMatchObject(
        stabilizeIds({
          text: "\uFFFC\uFFFCfirst\uFFFCnested\uFFFClast",
          blocks: [
            {
              id: "0",
              type: "container",
              attributes: { level: 1 },
              parents: [],
            },
            {
              id: "1",
              type: "text",
              attributes: {},
              parents: ["container"],
            },
            {
              id: "2",
              type: "leaf",
              attributes: {},
              parents: ["container"],
            },
            {
              id: "3",
              type: "text",
              attributes: {},
              parents: ["container"],
            },
          ],
          marks: [
            { id: "m1", type: "emphasis", range: "(14..19]", attributes: {} },
          ],
        })
      );
    });
    test("function children", () => {
      expect(
        stabilizeIds(
          block(Container, {}, (container) => {
            container.attributes.level = 1;

            return block(Leaf, {}, "test");
          })
        )
      ).toMatchObject(
        stabilizeIds({
          text: "\uFFFC\uFFFCtest",
          blocks: [
            {
              id: "0",
              type: "container",
              attributes: { level: 1 },
              parents: [],
            },
            {
              id: "1",
              type: "leaf",
              attributes: {},
              parents: ["container"],
            },
          ],
          marks: [],
        })
      );
    });
    test("preserves marks in children", () => {
      expect(
        stabilizeIds(
          block(Container, {}, block(Leaf, {}, mark(Emphasis, {}, "test")))
        )
      ).toMatchObject(
        stabilizeIds({
          text: "\uFFFC\uFFFC\uFFFCtest",
          blocks: [
            {
              id: "1",
              type: "container",
              attributes: {},
              parents: [],
            },
            {
              id: "2",
              type: "leaf",
              attributes: {},
              parents: ["container"],
            },
            {
              id: "t1",
              type: "text",
              attributes: {},
              parents: ["container", "leaf"],
              selfClosing: false,
            },
          ],
          marks: [
            {
              id: "3",
              type: "emphasis",
              attributes: {},
              range: "(2..7]",
            },
          ],
        })
      );
    });
    test("mutates child blocks and marks in-place", () => {
      let innerMark = mark(Emphasis, {}, "test");
      expect(innerMark.getValue().range).toBe("(0..5]");

      let innerBlock = block(Leaf, {}, innerMark);
      expect(innerBlock.getValue().parents).toMatchObject([]);
      expect(innerMark.getValue().range).toBe("(1..6]");

      let outer = block(Container, {}, innerBlock);

      expect(innerBlock.getValue().parents).toMatchObject(["container"]);
      expect(innerMark.getValue().range).toBe("(2..7]");
      expect(outer.blocks[1]).toBe(innerBlock.getValue());
      expect(outer.marks[0]).toBe(innerMark.getValue());
    });
  });

  describe("mark()", () => {
    test("string children", () => {
      expect(stabilizeIds(mark(Emphasis, {}, "test"))).toMatchObject(
        stabilizeIds({
          text: "\uFFFCtest",
          blocks: [
            {
              id: "t1",
              type: "text",
              attributes: {},
              parents: [],
              selfClosing: false,
            },
          ],
          marks: [
            {
              id: "1",
              type: "emphasis",
              attributes: {},
              range: "(0..5]",
            },
          ],
        })
      );
    });
    test("peritext children", () => {
      expect(
        stabilizeIds(mark(Emphasis, {}, block(Leaf, {}, "test")))
      ).toMatchObject(
        stabilizeIds({
          text: "\uFFFCtest",
          blocks: [
            {
              id: "0",
              type: "leaf",
              parents: [],
              attributes: {},
            },
          ],
          marks: [
            {
              id: "1",
              type: "emphasis",
              attributes: {},
              range: "(0..5]",
            },
          ],
        })
      );
    });
    test("mixed children", () => {
      expect(
        stabilizeIds(
          mark(Emphasis, {}, [
            "first",
            block(Leaf, {}, "nested"),
            mark(Emphasis, { decorations: ["underline"] }, "last"),
          ])
        )
      ).toMatchObject(
        stabilizeIds({
          text: "\uFFFCfirst\uFFFCnested\uFFFClast",
          blocks: [
            {
              id: "0",
              type: "text",
              attributes: {},
              parents: [],
            },
            {
              id: "1",
              type: "leaf",
              attributes: {},
              parents: [],
            },
            {
              id: "2",
              type: "text",
              attributes: {},
              parents: [],
            },
          ],
          marks: [
            {
              id: "m0",
              type: "emphasis",
              range: "(0..18]",
              attributes: {},
            },
            {
              id: "m1",
              type: "emphasis",
              range: "(13..18]",
              attributes: { decorations: ["underline"] },
            },
          ],
        })
      );
    });
    test("mutates child blocks and marks in-place", () => {
      let innerMark = mark(Emphasis, {}, "test");
      expect(innerMark.getValue().range).toBe("(0..5]");

      let innerBlock = block(Leaf, {}, innerMark);
      expect(innerBlock.getValue().parents).toMatchObject([]);
      expect(innerMark.getValue().range).toBe("(1..6]");

      let outer = mark(Emphasis, {}, innerBlock);
      expect(outer.blocks[0]).toBe(innerBlock.getValue());
      expect(outer.marks[1]).toBe(innerMark.getValue());
    });
  });

  describe("slice()", () => {
    test("string children", () => {
      expect(stabilizeIds(slice("test"))).toMatchObject(
        stabilizeIds({
          text: "\uFFFCtest",
          blocks: [
            {
              id: "t1",
              type: "text",
              attributes: {},
              parents: [],
              selfClosing: false,
            },
          ],
          marks: [
            {
              id: "1",
              type: "slice",
              attributes: {},
              range: "(0..5]",
            },
          ],
        })
      );
    });
    test("peritext children", () => {
      expect(stabilizeIds(slice(block(Leaf, {}, "test")))).toMatchObject(
        stabilizeIds({
          text: "\uFFFCtest",
          blocks: [
            {
              id: "0",
              type: "leaf",
              parents: [],
              attributes: {},
            },
          ],
          marks: [
            {
              id: "1",
              type: "slice",
              attributes: {},
              range: "(0..5]",
            },
          ],
        })
      );
    });
    test("mixed children", () => {
      expect(
        stabilizeIds(
          slice([
            "first",
            block(Leaf, {}, "nested"),
            mark(Emphasis, { decorations: ["underline"] }, "last"),
          ])
        )
      ).toMatchObject(
        stabilizeIds({
          text: "\uFFFCfirst\uFFFCnested\uFFFClast",
          blocks: [
            {
              id: "0",
              type: "text",
              attributes: {},
              parents: [],
            },
            {
              id: "1",
              type: "leaf",
              attributes: {},
              parents: [],
            },
            {
              id: "2",
              type: "text",
              attributes: {},
              parents: [],
            },
          ],
          marks: [
            {
              id: "m0",
              type: "slice",
              range: "(0..18]",
              attributes: {},
            },
            {
              id: "m1",
              type: "emphasis",
              range: "(13..18]",
              attributes: { decorations: ["underline"] },
            },
          ],
        })
      );
    });
  });

  describe("concat()", () => {
    test("zero args", () => {
      expect(concat()).toMatchObject({ text: "", blocks: [], marks: [] });
    });
    test("one arg", () => {
      expect(stabilizeIds(concat(block(Leaf, {})))).toMatchObject(
        stabilizeIds(block(Leaf, {}).peritext())
      );
    });
    test("many args", () => {
      expect(
        stabilizeIds(
          concat(
            block(Leaf, { name: "first" }),
            block(Leaf, { name: "second" }),
            block(Leaf, { name: "third" })
          )
        )
      ).toMatchObject(
        stabilizeIds({
          text: "\uFFFC\uFFFC\uFFFC",
          blocks: [
            {
              id: "1",
              type: "leaf",
              parents: [],
              attributes: {
                name: "first",
              },
            },
            {
              id: "2",
              type: "leaf",
              parents: [],
              attributes: {
                name: "second",
              },
            },
            {
              id: "3",
              type: "leaf",
              parents: [],
              attributes: {
                name: "third",
              },
            },
          ],
          marks: [],
        })
      );
    });
    test("nested calls", () => {
      expect(
        stabilizeIds(
          concat(
            concat(
              block(Leaf, { name: "first" }),
              block(Leaf, { name: "second" })
            ),
            concat(
              block(Leaf, { name: "third" }),
              block(Leaf, { name: "fourth" })
            )
          )
        )
      ).toMatchObject(
        stabilizeIds({
          text: "\uFFFC\uFFFC\uFFFC\uFFFC",
          blocks: [
            {
              id: "1",
              type: "leaf",
              parents: [],
              attributes: {
                name: "first",
              },
            },
            {
              id: "2",
              type: "leaf",
              parents: [],
              attributes: {
                name: "second",
              },
            },
            {
              id: "3",
              type: "leaf",
              parents: [],
              attributes: {
                name: "third",
              },
            },
            {
              id: "4",
              type: "leaf",
              parents: [],
              attributes: {
                name: "fourth",
              },
            },
          ],
          marks: [],
        })
      );
    });
    test("preserves marks", () => {
      expect(
        stabilizeIds(
          concat(
            mark(Emphasis, { name: "first" }, "start"),
            mark(Emphasis, { name: "second" }, "middle"),
            mark(Emphasis, { name: "third" }, "end")
          )
        )
      ).toMatchObject(
        stabilizeIds({
          text: "\uFFFCstart\uFFFCmiddle\uFFFCend",
          blocks: [
            {
              type: "text",
              id: "b1",
              parents: [],
              attributes: {},
              selfClosing: false,
            },
            {
              type: "text",
              id: "b2",
              parents: [],
              attributes: {},
              selfClosing: false,
            },
            {
              type: "text",
              id: "b3",
              parents: [],
              attributes: {},
              selfClosing: false,
            },
          ],
          marks: [
            {
              id: "1",
              type: "emphasis",
              attributes: { name: "first" },
              range: "(0..6]",
            },
            {
              id: "2",
              type: "emphasis",
              attributes: { name: "second" },
              range: "(6..13]",
            },
            {
              id: "3",
              type: "emphasis",
              attributes: { name: "third" },
              range: "(13..17]",
            },
          ],
        })
      );
    });
  });

  describe("insertAfter()", () => {
    describe("at the top level of the document", () => {
      test("insert after only root", () => {
        const doc = block(Container, { level: 1 }, block(Leaf, {}));

        const testDoc = insertAfter(doc, doc.getValue().id, block(Leaf, {}));

        expect(stabilizeIds(testDoc)).toMatchObject(
          stabilizeIds(
            concat(
              block(Container, { level: 1 }, block(Leaf, {})),
              block(Leaf, {})
            )
          )
        );
      });
      test("insert between two roots", () => {
        let target;
        const doc = concat(
          (target = block(Container, { level: 1 }, block(Leaf, {}))),
          block(Container, { level: 1 }, [block(Leaf, {}), block(Leaf, {})])
        );

        const testDoc = insertAfter(doc, target.getValue().id, block(Leaf, {}));

        expect(stabilizeIds(testDoc)).toMatchObject(
          stabilizeIds(
            concat(
              block(Container, { level: 1 }, block(Leaf, {})),
              block(Leaf, {}),
              block(Container, { level: 1 }, [block(Leaf, {}), block(Leaf, {})])
            )
          )
        );
      });
    });
    test("insert after only child", () => {
      let target;
      const doc = block(
        Container,
        { level: 1 },
        (target = block(Leaf, { name: "first" }))
      );

      const testDoc = insertAfter(
        doc,
        target.getValue().id,
        block(Leaf, { name: "inserted" })
      );

      expect(stabilizeIds(testDoc)).toMatchObject(
        stabilizeIds(
          block(Container, { level: 1 }, [
            block(Leaf, { name: "first" }),
            block(Leaf, { name: "inserted" }),
          ]).peritext()
        )
      );
    });
    test("insert between two children", () => {
      let target;
      const doc = block(Container, { level: 1 }, [
        (target = block(Leaf, { name: "first" })),
        block(Leaf, { name: "second" }),
      ]);

      const testDoc = insertAfter(
        doc,
        target.getValue().id,
        block(Leaf, { name: "inserted" })
      );

      expect(stabilizeIds(testDoc)).toMatchObject(
        stabilizeIds(
          block(Container, { level: 1 }, [
            block(Leaf, { name: "first" }),
            block(Leaf, { name: "inserted" }),
            block(Leaf, { name: "second" }),
          ]).peritext()
        )
      );
    });
    test("insert after child with its own children", () => {
      let target;
      const doc = block(Container, { level: 1 }, [
        (target = block(Container, { level: 2 }, [
          block(Leaf, {}),
          block(Leaf, {}),
        ])),
        block(Leaf, { name: "second" }),
      ]);

      const testDoc = insertAfter(
        doc,
        target.getValue().id,
        block(Leaf, { name: "inserted" })
      );

      expect(stabilizeIds(testDoc)).toMatchObject(
        stabilizeIds(
          block(Container, { level: 1 }, [
            block(Container, { level: 2 }, [block(Leaf, {}), block(Leaf, {})]),
            block(Leaf, { name: "inserted" }),
            block(Leaf, { name: "second" }),
          ]).peritext()
        )
      );
    });
    test("preserves marks", () => {
      let target;
      const doc = block(Container, { level: 1 }, [
        (target = block(
          Leaf,
          { name: "first" },
          mark(Emphasis, { name: "before" }, "Beginning text")
        )),
        block(
          Leaf,
          { name: "second" },
          mark(Emphasis, { name: "after" }, "ending text")
        ),
      ]);

      const testDoc = insertAfter(
        doc,
        target.getValue().id,
        block(
          Leaf,
          { name: "inserted" },
          mark(Emphasis, { name: "middle" }, "(inserted text)")
        )
      );

      expect(stabilizeIds(testDoc)).toMatchObject(
        stabilizeIds(
          block(Container, { level: 1 }, [
            block(
              Leaf,
              { name: "first" },
              mark(Emphasis, { name: "before" }, "Beginning text")
            ),
            block(
              Leaf,
              { name: "inserted" },
              mark(Emphasis, { name: "middle" }, "(inserted text)")
            ),
            block(
              Leaf,
              { name: "second" },
              mark(Emphasis, { name: "after" }, "ending text")
            ),
          ]).peritext()
        )
      );
    });
    test("preseves marks across insertion point", () => {
      let target;
      const doc = block(
        Container,
        { level: 1 },
        mark(Emphasis, {}, [
          (target = block(
            Leaf,
            { name: "first" },
            mark(Emphasis, {}, "Beginning text")
          )),
          block(Leaf, { name: "second" }, mark(Emphasis, {}, "ending text")),
        ])
      );

      const testDoc = insertAfter(
        doc,
        target.getValue().id,
        block(
          Leaf,
          { name: "inserted" },
          mark(Emphasis, { name: "middle" }, "(inserted text)")
        )
      );

      expect(stabilizeIds(testDoc)).toMatchObject(
        stabilizeIds(
          block(
            Container,
            { level: 1 },
            mark(Emphasis, {}, [
              block(
                Leaf,
                { name: "first" },
                mark(Emphasis, {}, "Beginning text")
              ),
              block(
                Leaf,
                { name: "inserted" },
                mark(Emphasis, { name: "middle" }, "(inserted text)")
              ),
              block(
                Leaf,
                { name: "second" },
                mark(Emphasis, {}, "ending text")
              ),
            ])
          ).peritext()
        )
      );
    });
    test("mutates blocks and marks in-place", () => {
      let beforeBlock = block(Leaf, {}, "before");
      let insertedBlock = block(Leaf, {}, "inserted");
      let afterMark = mark(Emphasis, {}, "after");
      let afterBlock = block(Leaf, {}, afterMark);

      let doc = insertAfter(
        concat(beforeBlock, afterBlock),
        beforeBlock.getValue().id,
        insertedBlock
      );

      expect(doc.blocks).toContain(beforeBlock.getValue());
      expect(doc.blocks).toContain(insertedBlock.getValue());
      expect(doc.blocks).toContain(afterBlock.getValue());
      expect(doc.marks).toContain(afterMark.getValue());
    });
  });

  describe("insertBefore()", () => {
    describe("at the top level of the document", () => {
      test("insert before only root", () => {
        let target;
        const doc = concat(
          (target = block(Container, { level: 1 }, block(Leaf, {})))
        );

        const testDoc = insertBefore(
          doc,
          target.getValue().id,
          block(Leaf, {})
        );

        expect(stabilizeIds(testDoc)).toMatchObject(
          stabilizeIds(
            concat(
              block(Leaf, {}),
              block(Container, { level: 1 }, block(Leaf, {}))
            )
          )
        );
      });
      test("insert between two roots", () => {
        let target;
        const doc = concat(
          block(Container, { level: 1 }, block(Leaf, {})),
          (target = block(Container, { level: 1 }, [
            block(Leaf, {}),
            block(Leaf, {}),
          ]))
        );

        const testDoc = insertBefore(
          doc,
          target.getValue().id,
          block(Leaf, {})
        );

        expect(stabilizeIds(testDoc)).toMatchObject(
          stabilizeIds(
            concat(
              block(Container, { level: 1 }, block(Leaf, {})),
              block(Leaf, {}),
              block(Container, { level: 1 }, [block(Leaf, {}), block(Leaf, {})])
            )
          )
        );
      });
    });
    test("insert before only child", () => {
      let target;
      const doc = block(Container, { level: 1 }, [(target = block(Leaf, {}))]);

      const testDoc = insertBefore(
        doc,
        target.getValue().id,
        block(Container, { level: 2 }, [block(Leaf, {}), block(Leaf, {})])
      );

      expect(stabilizeIds(testDoc)).toMatchObject(
        stabilizeIds(
          block(Container, { level: 1 }, [
            block(Container, { level: 2 }, [block(Leaf, {}), block(Leaf, {})]),
            block(Leaf, {}),
          ]).peritext()
        )
      );
    });
    test("insert between two children", () => {
      let target;
      const doc = block(Container, { level: 1 }, [
        (target = block(Leaf, { name: "first" })),
        block(Leaf, { name: "second" }),
      ]);

      const testDoc = insertAfter(
        doc,
        target.getValue().id,
        block(Leaf, { name: "inserted" })
      );

      expect(stabilizeIds(testDoc)).toMatchObject(
        stabilizeIds(
          block(Container, { level: 1 }, [
            block(Leaf, { name: "first" }),
            block(Leaf, { name: "inserted" }),
            block(Leaf, { name: "second" }),
          ]).peritext()
        )
      );
    });
    test("insert after child with its own children", () => {
      let target;
      const doc = block(Container, { level: 1 }, [
        block(Container, { level: 2 }, [block(Leaf, {}), block(Leaf, {})]),
        (target = block(Leaf, { name: "second" })),
      ]);

      const testDoc = insertBefore(
        doc,
        target.getValue().id,
        block(Leaf, { name: "inserted" })
      );

      expect(stabilizeIds(testDoc)).toMatchObject(
        stabilizeIds(
          block(Container, { level: 1 }, [
            block(Container, { level: 2 }, [block(Leaf, {}), block(Leaf, {})]),
            block(Leaf, { name: "inserted" }),
            block(Leaf, { name: "second" }),
          ]).peritext()
        )
      );
    });
    test("preserves marks", () => {
      let target;
      const doc = block(Container, { level: 1 }, [
        block(
          Leaf,
          { name: "first" },
          mark(Emphasis, { name: "before" }, "Beginning text")
        ),
        (target = block(
          Leaf,
          { name: "second" },
          mark(Emphasis, { name: "after" }, "ending text")
        )),
      ]);

      const testDoc = insertBefore(
        doc,
        target.getValue().id,
        block(
          Leaf,
          { name: "inserted" },
          mark(Emphasis, { name: "middle" }, "(inserted text)")
        )
      );

      expect(stabilizeIds(testDoc)).toMatchObject(
        stabilizeIds(
          block(Container, { level: 1 }, [
            block(
              Leaf,
              { name: "first" },
              mark(Emphasis, { name: "before" }, "Beginning text")
            ),
            block(
              Leaf,
              { name: "inserted" },
              mark(Emphasis, { name: "middle" }, "(inserted text)")
            ),
            block(
              Leaf,
              { name: "second" },
              mark(Emphasis, { name: "after" }, "ending text")
            ),
          ]).peritext()
        )
      );
    });
    test("preseves marks across insertion point", () => {
      let target;
      const doc = block(
        Container,
        { level: 1 },
        mark(Emphasis, {}, [
          block(Leaf, { name: "first" }, mark(Emphasis, {}, "Beginning text")),
          (target = block(
            Leaf,
            { name: "second" },
            mark(Emphasis, {}, "ending text")
          )),
        ])
      );

      const testDoc = insertBefore(
        doc,
        target.getValue().id,
        block(
          Leaf,
          { name: "inserted" },
          mark(Emphasis, { name: "middle" }, "(inserted text)")
        )
      );

      expect(stabilizeIds(testDoc)).toMatchObject(
        stabilizeIds(
          block(
            Container,
            { level: 1 },
            mark(Emphasis, {}, [
              block(
                Leaf,
                { name: "first" },
                mark(Emphasis, {}, "Beginning text")
              ),
              block(
                Leaf,
                { name: "inserted" },
                mark(Emphasis, { name: "middle" }, "(inserted text)")
              ),
              block(
                Leaf,
                { name: "second" },
                mark(Emphasis, {}, "ending text")
              ),
            ])
          ).peritext()
        )
      );
    });
    test("mutates blocks and marks in-place", () => {
      let beforeBlock = block(Leaf, {}, "before");
      let insertedBlock = block(Leaf, {}, "inserted");
      let afterMark = mark(Emphasis, {}, "after");
      let afterBlock = block(Leaf, {}, afterMark);

      let doc = insertBefore(
        concat(beforeBlock, afterBlock),
        afterBlock.getValue().id,
        insertedBlock
      );

      expect(doc.blocks).toContain(beforeBlock.getValue());
      expect(doc.blocks).toContain(insertedBlock.getValue());
      expect(doc.blocks).toContain(afterBlock.getValue());
      expect(doc.marks).toContain(afterMark.getValue());
    });
  });

  describe("getDescendants()", () => {
    test("flat children", () => {
      const doc = block(Container, {}, [
        block(Leaf, {}),
        block(Leaf, {}),
        block(Leaf, {}),
      ]);

      expect(getDescendants(doc, doc.getValue().id)).toMatchObject(
        doc.blocks.slice(1)
      );
    });
    test("nested descendants", () => {
      const doc = block(Container, {}, [
        block(Container, {}, [block(Leaf, {}), block(Leaf, {})]),
        block(Container, {}, [block(Container, {}, block(Leaf, {}))]),
        block(Leaf, {}),
      ]);

      expect(getDescendants(doc, doc.getValue().id)).toMatchObject(
        doc.blocks.slice(1)
      );
    });
    test("doesn't return siblings of target", () => {
      let target;
      let descendant1;
      let descendant2;
      const doc = block(Container, {}, [
        block(Container, {}, [block(Leaf, {}), block(Leaf, {})]),
        (target = block(Container, {}, [
          (descendant1 = block(Container, {}, (descendant2 = block(Leaf, {})))),
        ])),
        block(Leaf, {}),
      ]);

      expect(getDescendants(doc, target.getValue().id)).toMatchObject(
        getBlocksByIds(
          doc,
          descendant1.getValue().id,
          descendant2.getValue().id
        )
      );
    });
  });

  describe("getChildren()", () => {
    test("flat children", () => {
      const doc = block(Container, {}, [
        block(Leaf, {}),
        block(Leaf, {}),
        block(Leaf, {}),
      ]);

      expect(getChildren(doc, doc.getValue().id)).toMatchObject(
        doc.blocks.slice(1)
      );
    });
    test("nested descendants", () => {
      const doc = block(Container, {}, [
        block(Container, {}, [block(Leaf, {}), block(Leaf, {})]),
        block(Container, {}, [block(Container, {}, block(Leaf, {}))]),
        block(Leaf, {}),
      ]);

      expect(getChildren(doc, doc.getValue().id)).toMatchObject([
        doc.blocks[1],
        doc.blocks[4],
        doc.blocks[7],
      ]);
    });
    test("doesn't return siblings of target", () => {
      let target;
      let child;
      const doc = block(Container, {}, [
        block(Container, {}, [block(Leaf, {}), block(Leaf, {})]),
        (target = block(Container, {}, [
          (child = block(Container, {}, block(Leaf, {}))),
        ])),
        block(Leaf, {}),
      ]);

      expect(getChildren(doc, target.getValue().id)).toMatchObject(
        getBlocksByIds(doc, child.getValue().id)
      );
    });
  });

  describe("groupChildren()", () => {
    test("applies wrapper", () => {
      const doc = block(Container, { level: 1 }, [
        block(Leaf, {}),
        block(Leaf, {}),
        block(Leaf, {}),
        block(Leaf, {}),
        block(Leaf, {}),
        block(Leaf, {}),
      ]);

      const testDoc = groupChildren(
        doc.peritext(),
        doc.getValue().id,
        3,
        Container,
        {
          level: 2,
        }
      );

      expect(stabilizeIds(testDoc)).toMatchObject(
        stabilizeIds(
          block(Container, { level: 1 }, [
            block(Container, { level: 2 }, [
              block(Leaf, {}),
              block(Leaf, {}),
              block(Leaf, {}),
            ]),
            block(Container, { level: 2 }, [
              block(Leaf, {}),
              block(Leaf, {}),
              block(Leaf, {}),
            ]),
          ]).peritext()
        )
      );
    });

    test("trailing group is handled", () => {
      const doc = block(Container, { level: 1 }, [
        block(Leaf, {}),
        block(Leaf, {}),
        block(Leaf, {}),
        block(Leaf, {}),
        block(Leaf, {}),
        block(Leaf, {}),
      ]);

      const testDoc = groupChildren(doc, doc.getValue().id, 4, Container, {
        level: 2,
      });
      expect(stabilizeIds(testDoc)).toMatchObject(
        stabilizeIds(
          block(Container, { level: 1 }, [
            block(Container, { level: 2 }, [
              block(Leaf, {}),
              block(Leaf, {}),
              block(Leaf, {}),
              block(Leaf, {}),
            ]),
            block(Container, { level: 2 }, [block(Leaf, {}), block(Leaf, {})]),
          ]).peritext()
        )
      );
    });

    test("preserves marks", () => {
      const doc = block(Container, {}, [
        block(Leaf, {}, mark(Emphasis, {}, "first")),
        block(Leaf, {}),
        block(Leaf, {}, mark(Emphasis, {}, "second")),
        block(Leaf, {}),
      ]);
      expect(
        stabilizeIds(groupChildren(doc, doc.getValue().id, 2, Container, {}))
      ).toMatchObject(
        stabilizeIds({
          text: "\uFFFC\uFFFC\uFFFC\uFFFCfirst\uFFFC\uFFFC\uFFFC\uFFFCsecond\uFFFC",
          blocks: [
            {
              id: "0",
              type: "container",
              attributes: {},
              parents: [],
              selfClosing: false,
            },
            {
              id: "1",
              type: "container",
              attributes: {},
              parents: ["container"],
              selfClosing: false,
            },
            {
              id: "2",
              type: "leaf",
              attributes: {},
              parents: ["container", "container"],
              selfClosing: false,
            },
            {
              id: "t1",
              type: "text",
              attributes: {},
              parents: ["container", "container", "leaf"],
              selfClosing: false,
            },
            {
              id: "3",
              type: "leaf",
              attributes: {},
              parents: ["container", "container"],
              selfClosing: false,
            },
            {
              id: "4",
              type: "container",
              attributes: {},
              parents: ["container"],
              selfClosing: false,
            },
            {
              id: "5",
              type: "leaf",
              attributes: {},
              parents: ["container", "container"],
              selfClosing: false,
            },
            {
              id: "t2",
              type: "text",
              attributes: {},
              parents: ["container", "container", "leaf"],
              selfClosing: false,
            },
            {
              id: "6",
              type: "leaf",
              attributes: {},
              parents: ["container", "container"],
              selfClosing: false,
            },
          ],
          marks: [
            { id: "7", type: "emphasis", attributes: {}, range: "(3..9]" },
            { id: "8", type: "emphasis", attributes: {}, range: "(12..19]" },
          ],
        })
      );
    });

    test("nested descendants", () => {
      const doc = block(Container, { level: 1 }, [
        block(Container, { level: 3 }, block(Leaf, {})),
        block(Leaf, {}),
        block(Container, { level: 3 }, block(Leaf, {})),
        block(Leaf, {}),
        block(Container, { level: 3 }, block(Leaf, {})),
        block(Leaf, {}),
      ]);

      const testDoc = groupChildren(
        doc.peritext(),
        doc.getValue().id,
        3,
        Container,
        {
          level: 2,
        }
      );

      expect(stabilizeIds(testDoc)).toMatchObject(
        stabilizeIds(
          block(Container, { level: 1 }, [
            block(Container, { level: 2 }, [
              block(Container, { level: 3 }, block(Leaf, {})),
              block(Leaf, {}),
              block(Container, { level: 3 }, block(Leaf, {})),
            ]),
            block(Container, { level: 2 }, [
              block(Leaf, {}),
              block(Container, { level: 3 }, block(Leaf, {})),
              block(Leaf, {}),
            ]),
          ]).peritext()
        )
      );
    });

    test("mutates blocks and marks in-place", () => {
      let targetMark = mark(Emphasis, {}, "test");
      let targetBlock = block(Leaf, {}, targetMark);

      let doc = block(Container, { level: 1 }, [
        block(Leaf, {}),
        block(Leaf, {}),
        targetBlock,
        block(Leaf, {}),
      ]);

      let grouped = groupChildren(doc, doc.getValue().id, 2, Container, {
        level: 2,
      });

      expect(grouped.blocks).toContain(doc.getValue());
      expect(grouped.blocks).toContain(targetBlock.getValue());
      expect(grouped.marks).toContain(targetMark.getValue());

      expect(targetBlock.getValue().parents).toMatchObject([
        "container",
        "container",
      ]);

      expect(targetMark.getValue().range).toBe("(6..11]");
    });

    describe("groupSize edge cases", () => {
      test("1", () => {
        const doc = block(Container, { level: 1 }, [
          block(Leaf, {}),
          block(Leaf, {}),
          block(Leaf, {}),
        ]);

        const rootBlock = doc.getValue();
        const testDoc = groupChildren(doc, rootBlock.id, 1, Container, {
          level: 2,
        });

        expect(stabilizeIds(testDoc)).toMatchObject(
          stabilizeIds(
            block(Container, { level: 1 }, [
              block(Container, { level: 2 }, block(Leaf, {})),
              block(Container, { level: 2 }, block(Leaf, {})),
              block(Container, { level: 2 }, block(Leaf, {})),
            ]).peritext()
          )
        );
      });

      test("0", () => {
        const doc = block(Container, { level: 1 }, [
          block(Leaf, {}),
          block(Leaf, {}),
          block(Leaf, {}),
        ]);

        const rootBlock = doc.getValue();
        const testDoc = groupChildren(
          doc.peritext(),
          rootBlock.id,
          0,
          Container,
          {
            level: 2,
          }
        );

        expect(stabilizeIds(testDoc)).toMatchObject(
          stabilizeIds(
            block(Container, { level: 1 }, [
              block(Leaf, {}),
              block(Leaf, {}),
              block(Leaf, {}),
            ]).peritext()
          )
        );
      });

      test("-1", () => {
        const doc = block(Container, { level: 1 }, [
          block(Leaf, {}),
          block(Leaf, {}),
          block(Leaf, {}),
        ]);

        const rootBlock = doc.getValue();
        const testDoc = groupChildren(doc, rootBlock.id, -1, Container, {
          level: 2,
        });

        expect(stabilizeIds(testDoc)).toMatchObject(
          stabilizeIds(
            block(Container, { level: 1 }, [
              block(Leaf, {}),
              block(Leaf, {}),
              block(Leaf, {}),
            ]).peritext()
          )
        );
      });

      test("Infinity", () => {
        const doc = block(Container, { level: 1 }, [
          block(Leaf, {}),
          block(Leaf, {}),
          block(Leaf, {}),
          block(Leaf, {}),
          block(Leaf, {}),
          block(Leaf, {}),
        ]);

        const rootBlock = doc.getValue();
        const testDoc = groupChildren(doc, rootBlock.id, Infinity, Container, {
          level: 2,
        });

        expect(stabilizeIds(testDoc)).toMatchObject(
          stabilizeIds(
            block(Container, { level: 1 }, [
              block(Container, { level: 2 }, [
                block(Leaf, {}),
                block(Leaf, {}),
                block(Leaf, {}),
                block(Leaf, {}),
                block(Leaf, {}),
                block(Leaf, {}),
              ]),
            ]).peritext()
          )
        );
      });
    });
  });
});

/* eslint-enable max-classes-per-file */
