import OffsetSource, { Group } from "../src";

describe("Group", () => {
  test("legacy groups serialize without a theme", () => {
    let group = new Group({
      start: 0,
      end: 1,
      attributes: {
        artDirection: "stacked",
        layout: "inline",
      },
    });

    expect(group.toJSON()).toMatchObject({
      type: "-offset-group",
      start: 0,
      end: 1,
      attributes: {
        "-offset-artDirection": "stacked",
        "-offset-layout": "inline",
      },
    });
    expect(group.toJSON().attributes).not.toHaveProperty("-offset-theme");
  });

  test("groups serialize with an optional theme", () => {
    let group = new Group({
      start: 0,
      end: 1,
      attributes: {
        artDirection: "stacked",
        layout: "inline",
        theme: "brand-dark",
      },
    });

    expect(group.toJSON()).toMatchObject({
      type: "-offset-group",
      start: 0,
      end: 1,
      attributes: {
        "-offset-artDirection": "stacked",
        "-offset-layout": "inline",
        "-offset-theme": "brand-dark",
      },
    });
  });

  test("documents hydrate legacy groups unchanged", () => {
    let document = new OffsetSource({
      content: "\uFFFC",
      annotations: [
        {
          id: "group-1",
          type: "-offset-group",
          start: 0,
          end: 1,
          attributes: {
            "-offset-artDirection": "stacked",
            "-offset-layout": "inline",
          },
        },
      ],
    });

    let [group] = document.annotations;

    expect(group).toBeInstanceOf(Group);
    expect((group as Group).attributes).toEqual({
      artDirection: "stacked",
      layout: "inline",
    });
    expect(document.toJSON()).toMatchObject({
      content: "\uFFFC",
      annotations: [
        {
          id: "group-1",
          type: "-offset-group",
          start: 0,
          end: 1,
          attributes: {
            "-offset-artDirection": "stacked",
            "-offset-layout": "inline",
          },
        },
      ],
    });
  });

  test("documents hydrate themed groups with the shared contract field", () => {
    let document = new OffsetSource({
      content: "\uFFFC",
      annotations: [
        {
          id: "group-1",
          type: "-offset-group",
          start: 0,
          end: 1,
          attributes: {
            "-offset-artDirection": "stacked",
            "-offset-layout": "inline",
            "-offset-theme": "brand-dark",
          },
        },
      ],
    });

    let [group] = document.annotations;

    expect(group).toBeInstanceOf(Group);
    expect((group as Group).attributes).toEqual({
      artDirection: "stacked",
      layout: "inline",
      theme: "brand-dark",
    });
    expect(document.toJSON()).toMatchObject({
      content: "\uFFFC",
      annotations: [
        {
          id: "group-1",
          type: "-offset-group",
          start: 0,
          end: 1,
          attributes: {
            "-offset-artDirection": "stacked",
            "-offset-layout": "inline",
            "-offset-theme": "brand-dark",
          },
        },
      ],
    });
  });
});
