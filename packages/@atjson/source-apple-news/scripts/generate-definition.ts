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
