/** eslint-env: node */
import Document from "@atjson/document";
import { writeFileSync } from "fs";
import { join } from "path";
import { format } from "prettier";
import { JSDOM } from "jsdom";
import { Editor, SchemaCompiledItemDefinition } from "../ckeditor";

let options = {
  language: "ts",
  build: "@ckeditor/ckeditor5-build-classic",
  convertTo: "@atjson/offset-annotations"
};

let dom = new JSDOM(``, {
  url: "https://atjson.condenast.io"
});

(global as any).window = dom.window;
[
  "document",
  "location",
  "navigator",
  "localStorage",
  "DOMParser",
  "HTMLTextAreaElement",
  "Node"
].forEach(key => {
  (global as any)[key] = (dom.window as any)[key];
});

function classify(name: string) {
  return name[0].toUpperCase() + name.slice(1);
}

function dasherize(name: string) {
  return name.replace(/([A-Z])/g, chr => `-${chr.toLowerCase()}`);
}

function camelize(name: string) {
  return name
    .replace(/\-([a-zA-Z])/g, chr => `${chr.toUpperCase()}`)
    .replace("-", "");
}

function guessSourceName(name: string) {
  let parts = name.split("/");
  let moduleName = parts[parts.length - 1].replace(/source|annotations/, "");
  return `${classify(camelize(moduleName))}Source`;
}

import(options.build).then(async (Build: typeof Editor) => {
  import(options.convertTo).then(
    async (Source: { default: typeof Document }) => {
      if (
        !["ts", "typescript", "js", "javascript"].includes(options.language)
      ) {
        throw new Error(`Only "js" or "ts" are supported for languages.`);
      }

      let language: "typescript" | "javascript" = ["ts", "typescript"].includes(
        options.language
      )
        ? "typescript"
        : "javascript";
      let extension = language === "typescript" ? "ts" : "js";
      let parser: "typescript" | "babel" =
        language === "javascript" ? "babel" : "typescript";

      let div = dom.window.document.createElement("div");
      dom.window.document.body.appendChild(div);
      let editor = await Build.create(div);
      let schemaDefinition = editor.model.schema.getDefinitions();
      let converter = [];
      let schemas: SchemaCompiledItemDefinition[] = [];
      // Guess the vendor prefix
      let vendorPrefix = Source.default.schema[0].vendorPrefix;

      for (let key in schemaDefinition) {
        let schema = schemaDefinition[key];
        if (schema.name[0] === "$") {
          continue;
        }
        schemas.push(schema);
      }

      for (let schema of schemas) {
        let attributes =
          schema.allowAttributes == null
            ? []
            : Array.isArray(schema.allowAttributes)
            ? schema.allowAttributes
            : [schema.allowAttributes];

        let AnnotationClass;
        if (schema.isBlock) {
          AnnotationClass = "BlockAnnotation";
        } else if (schema.isInline) {
          AnnotationClass = "InlineAnnotation";
        } else if (schema.isObject) {
          AnnotationClass = "ObjectAnnotation";
        } else {
          AnnotationClass = "BlockAnnotation";
        }

        if (language === "typescript") {
          writeFileSync(
            join(
              __dirname,
              "..",
              "src",
              "annotations",
              `${dasherize(schema.name)}.${extension}`
            ),
            format(
              `
// This file is automatically generated by a script.
import { ${AnnotationClass} } from "@atjson/document";

export class ${classify(schema.name)} extends ${AnnotationClass}${
                attributes.length
                  ? `<{
  ${attributes.map(attribute => `${attribute}: unknown;`).join("\n")}
}>`
                  : ""
              } {
  static vendorPrefix = "ckeditor";
  static type = "${schema.name}";
}
`,
              { parser }
            )
          );
        } else if (language === "javascript") {
          writeFileSync(
            join(
              __dirname,
              "..",
              "src",
              "annotations",
              `${dasherize(schema.name)}.${extension}`
            ),
            format(
              `
// This file is automatically generated by a script.
import { ${AnnotationClass} } from "@atjson/document";

export class ${classify(schema.name)} extends ${AnnotationClass} {
  static vendorPrefix = "ckeditor";
  static type = "${schema.name}";
}
`,
              { parser }
            )
          );
        }

        converter.push(`
doc.where({ type: "-ckeditor-${schema.name}" })
  .set({ type: "-${vendorPrefix}-${schema.name}" })${
          attributes.length
            ? `
  .rename({
    attributes: {
      ${attributes
        .map(
          attribute =>
            `"-ckeditor-${attribute}": "-${vendorPrefix}-${attribute}",`
        )
        .join("\n")}
    }
  })`
            : ""
        };
    `);
      }

      writeFileSync(
        join(__dirname, "..", "src", "annotations", `index.${extension}`),
        format(
          `${schemas
            .map(schema => `export * from "./${dasherize(schema.name)}";`)
            .join("\n")}`,
          { parser }
        )
      );

      writeFileSync(
        join(__dirname, "..", "src", `converter.${extension}`),
        format(
          `
import CKEditorSource from "./source";
import ${guessSourceName(options.convertTo)} from "${options.convertTo}";

CKEditorSource.defineConverterTo(${guessSourceName(options.convertTo)}, doc => {
  ${converter.join("\n\n")}

  return doc;
});
    `,
          { parser }
        )
      );
      process.exit(1);
    }
  );
});
