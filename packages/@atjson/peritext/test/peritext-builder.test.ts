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

describe("peritext-builder", () => {
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
          text: "\uFFFC\uFFFCtest",
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
          ],
          marks: [
            {
              id: "3",
              type: "emphasis",
              attributes: {},
              range: "(2..6]",
            },
          ],
        })
      );
    });
  });

  describe("mark", () => {
    test("string children", () => {
      expect(stabilizeIds(mark(Emphasis, {}, "test"))).toMatchObject(
        stabilizeIds({
          text: "test",
          blocks: [],
          marks: [
            {
              id: "1",
              type: "emphasis",
              attributes: {},
              range: "(0..4]",
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
          text: "startmiddleend",
          blocks: [],
          marks: [
            {
              id: "1",
              type: "emphasis",
              attributes: { name: "first" },
              range: "(0..5]",
            },
            {
              id: "2",
              type: "emphasis",
              attributes: { name: "second" },
              range: "(5..11]",
            },
            {
              id: "3",
              type: "emphasis",
              attributes: { name: "third" },
              range: "(11..14]",
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

      const testDoc = groupChildren(doc, doc.getValue().id, 3, Container, {
        level: 2,
      });

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
          text: "\uFFFC\uFFFC\uFFFCfirst\uFFFC\uFFFC\uFFFCsecond\uFFFC",
          blocks: [
            {
              id: "0",
              type: "container",
              attributes: {},
              parents: [],
            },
            {
              id: "1",
              type: "container",
              attributes: {},
              parents: ["container"],
            },
            {
              id: "2",
              type: "leaf",
              attributes: {},
              parents: ["container", "container"],
            },
            {
              id: "3",
              type: "leaf",
              attributes: {},
              parents: ["container", "container"],
            },
            {
              id: "4",
              type: "container",
              attributes: {},
              parents: ["container"],
            },
            {
              id: "5",
              type: "leaf",
              attributes: {},
              parents: ["container", "container"],
            },
            {
              id: "6",
              type: "leaf",
              attributes: {},
              parents: ["container", "container"],
            },
          ],
          marks: [
            { id: "7", type: "emphasis", attributes: {}, range: "(3..8]" },
            { id: "8", type: "emphasis", attributes: {}, range: "(11..17]" },
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

      const testDoc = groupChildren(doc, doc.getValue().id, 3, Container, {
        level: 2,
      });

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
        const testDoc = groupChildren(doc, rootBlock.id, 0, Container, {
          level: 2,
        });

        expect(stabilizeIds(testDoc)).toMatchObject(
          stabilizeIds(
            block(Container, { level: 1 }, [
              block(Leaf, {}),
              block(Leaf, {}),
              block(Leaf, {}),
            ])
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
