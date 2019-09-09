import OffsetSource from "@atjson/offset-annotations";
import CommonmarkRenderer from "@atjson/renderer-commonmark";
import HTMLSource from "@atjson/source-html";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { format } from "prettier";

interface Definition {
  URL: string;
  inherits?: string;
  example?: string;
  documentation: string;
  definitions: {
    [key: string]: Property;
  };
}

interface Property {
  required: boolean;
  deprecated: boolean;
  documentation: string;
  type: string;
}

let definitions = JSON.parse(
  readFileSync("/tmp/apple-news-format.json").toString()
) as {
  [key: string]: Definition;
};

let types: { [key: string]: any } = {
  Color: "string",
  SupportedUnits: "string"
};

Object.keys(definitions)
  .sort()
  .forEach(className => {
    let inherits = definitions[className].inherits;
    if (inherits) {
      if (types[inherits]) {
        types[inherits] = `${types[inherits]} | ${className}`;
      } else {
        types[inherits] = className;
      }
    }
  });

types.Text = Object.keys(definitions)
  .sort()
  .filter(className => {
    return (
      definitions[className].inherits === "Component" &&
      definitions[className].definitions.text != null
    );
  })
  .join(" | ");

types.ArticleStructure = Object.keys(definitions)
  .sort()
  .filter(className => {
    return (
      definitions[className].inherits === "Component" &&
      definitions[className].definitions.components != null
    );
  })
  .join(" | ");

definitions.Text = {
  URL: "https://developer.apple.com/documentation/apple_news/text",
  documentation: `<p>Apple News Format offers a range of <code class="code-voice"><span>Text</span></code> components, each with its own <code class="code-voice"><span>role</span></code>. You can use the <a href="https://developer.apple.com/documentation/apple_news/title">Title</a> component for title text, <a href="https://developer.apple.com/documentation/apple_news/body">Body</a> for body text, <a href="https://developer.apple.com/documentation/apple_news/intro">Intro</a> for an article introduction, <a href="https://developer.apple.com/documentation/apple_news/caption">Caption</a> text for media.</p><p>The text you provide can be formatted as HTML or Markdown, or it can be unformatted. Your component’s overall text style is determined by its <a href="https://developer.apple.com/documentation/apple_news/componenttextstyle">ComponentTextStyle</a>. For styling ranges of text, your HTML or Markdown can apply <a href="https://developer.apple.com/documentation/apple_news/textstyle">TextStyle</a> objects, and your unformatted text can be formatted by <a href="https://developer.apple.com/documentation/apple_news/inlinetextstyle">InlineTextStyle</a> objects.</p>`,
  definitions: {}
};

definitions.ArticleStructure = {
  URL:
    "https://developer.apple.com/documentation/apple_news/apple_news_format/components/nesting_components_in_an_article",
  documentation: `<div><p>A <em>nested</em> component is a child of the parent component that contains it. The child component is positioned and rendered relative to that parent.  The minimum size of a container component is determined by the size of its child components. </p><aside class="aside aside- tip" aria-label="tip"><p class="aside - name">Tip</p><p>If you use an anchor to attach multiple children to the same side of their parent component, the children will "stack" to create a cleanly aligned header. For information about using container components and anchors, see <a href="https://developer.apple.com/documentation/apple_news/apple_news_format_tutorials#2969756">Advanced Design Tutorial 2: Layout and Positioning</a>.</p></aside><p>Many design and layout effects require you to use hierarchies of nested components. For example, you can create a layering effect by nesting content (such as a <code class="code - voice"><span>title</span></code>) inside a parent component that has a background <a href="https://developer.apple.com/documentation/apple_news/fill">Fill</a>. Any content displayed by the parent—as well as any content from its child components—is layered in front of the parent’s background fill, as shown in this example.</p><figure id="2982320"><img class="centered - block" src="https://docs-assets.developer.apple.com/published/33ecdabf9e/b5a4c4b1-fcd4-4d01-8de9-cad5bc7cf8a4.png" srcset="https://docs-assets.developer.apple.com/published/33ecdabf9e/b5a4c4b1-fcd4-4d01-8de9-cad5bc7cf8a4.png 1x, https://docs-assets.developer.apple.com/published/d1e0d953e4/99eca664-5e1b-41d0-8aec-f0595ecdd0d6.png 2x" alt="" width="394" height="auto"></figure><p></p><p>Apple News Format has several container components that allow you to nest other components within them:</p><p>	•	<a href="https://developer.apple.com/documentation/apple_news/chapter">Chapter</a></p><p>	•	<a href="https://developer.apple.com/documentation/apple_news/header">Header</a></p><p>	•	<a href="https://developer.apple.com/documentation/apple_news/section-ka8">Section</a></p><p>	•	<a href="https://developer.apple.com/documentation/apple_news/container">Container</a></p><p>The <a href="https://developer.apple.com/documentation/apple_news/aside">Aside</a> component also lets you nest other components, but generally contains content that is not directly related to your article. </p><p>The following example shows a section component with two child components (<code class="code-voice"><span>title</span></code> and <code class="code-voice"><span>photo</span></code>) defined in its components array. </p><figure id="3150964"><div class="formatted-content"><div class="code-listing">`,
  example: `{
  "role": "section",
  "components": [
  {
     "role": "title",
     "text": "A Photo",
   },
  {
     "role": "photo",
     "URL": "bundle://.",
     }
    ]
}
`,
  definitions: {}
};

function heredoc(html: string) {
  let doc = HTMLSource.fromRaw(html).convertTo(OffsetSource);
  doc.where({ type: "-offset-link" }).update(link => {
    if (link.attributes.url.indexOf("/") === 0) {
      link.attributes.url = `https://developer.apple.com${link.attributes.url}`;
    }
  });
  doc
    .where({ type: "-offset-list" })
    .set({ attributes: { "-offset-tight": true } });
  return CommonmarkRenderer.render(doc);
}
writeFileSync(
  join(__dirname, "../src/apple-news-format.ts"),
  format(
    `
${Object.keys(definitions)
  .filter(className => className.indexOf(".") === -1)
  .sort()
  .map(className => {
    let definition = definitions[className];
    if (types[className]) {
      // This is a type;
      return `/**
  * ${heredoc(definition.documentation)
    .trimRight()
    .split("\n")
    .join("\n * ")}
 * @see ${definition.URL}
 */
export type ${className} = ${types[className]};`;
    }

    return `/**
 * ${heredoc(definition.documentation)
   .trimRight()
   .split("\n")
   .join("\n * ")}${
      definition.example
        ? `\n * @example\n * \`\`\`json\n * ${definition.example
            .split("\n")
            .join("\n * ")} \`\`\``
        : ""
    }
 * @see ${definition.URL}
 */
export interface ${className} {
${Object.keys(definition.definitions)
  .sort((a, b) => {
    let propertyA = definition.definitions[a]!;
    let propertyB = definition.definitions[b]!;

    if (propertyA.required === propertyB.required) {
      return a.toLowerCase() > b.toLowerCase() ? 1 : a === b ? 0 : -1;
    } else {
      return propertyA.required ? -1 : 1;
    }
  })
  .map(propertyName => {
    let property = definition.definitions[propertyName];
    let type = property.type;
    if (type === "RecordStore.records[]") {
      type = "any[]"; // Derive from definitions
    } else if (type.indexOf(".") !== -1) {
      let reference = definitions[type];
      if (Object.keys(reference.definitions).length) {
        type = `{\n    ${Object.keys(reference.definitions)
          .sort()
          .map(nestedName => {
            let def = reference.definitions[nestedName];
            return `${nestedName}${def.required ? "" : "?"}: ${def.type};`;
          })
          .join("\n    ")}
  }`;
      } else {
        type = "any";
      }
    }

    return `  /**
   * ${heredoc(property.documentation)
     .trimRight()
     .split("\n")
     .join("\n   * ")}${property.deprecated ? "\n   * @deprecated" : ""}
   */
  ${propertyName}${property.required ? "" : "?"}: ${type};`;
  })
  .join("\n\n")}
}`.trimRight();
  })
  .join("\n\n")}
`,
    { parser: "typescript" }
  )
);
