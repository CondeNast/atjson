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

function annotationDefinition(name: string, definition: Definition) {
  let isContainer = definition.definitions.components;
  let isBlock = definition.definitions.text;
  let superclass =
    isBlock || isContainer ? "BlockAnnotation" : "ObjectAnnotation";
  let imports = Object.keys(
    Object.keys(definition.definitions).reduce(
      (typeMap, propertyName) => {
        let property = definition.definitions[propertyName];
        let resolvedType = property.type;

        if (resolvedType.indexOf(".") !== -1) {
          if (Object.keys(definitions[property.type].definitions).length) {
            resolvedType = Object.values(
              definitions[property.type].definitions
            )[0].type;
          } else {
            resolvedType = "any";
          }
        }

        resolvedType
          .split(" | ")
          .map(type => {
            if (type.indexOf(".") !== -1) {
              return type;
            }
            return type.trim().replace("[]", "");
          })
          .filter(type => {
            return type.match(/^[A-Z]/) && type !== "Component";
          })
          .forEach(type => {
            typeMap[type] = true;
          });

        return typeMap;
      },
      {} as { [key: string]: boolean }
    )
  );

  return `
// ⚠️ Generated via script; modifications may be overridden
import { ${superclass} } from "@atjson/document";
${
  imports.length
    ? `import { ${imports.sort().join(", ")} } from "../apple-news-format";\n`
    : ""
}
export class ${name} extends ${superclass}<{
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
  .filter(key => {
    return key !== "components" && key !== "text";
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
    return `  ${propertyName}${property.required ? "" : "?"}: ${type};`;
  })
  .join("\n")}
}> {
  static vendorPrefix = "apple-news";
  static type = "${name}";
}
`;
}

let components = Object.keys(definitions).filter(className => {
  return definitions[className].inherits === "Component";
});

components.forEach(className => {
  let definition = definitions[className];

  writeFileSync(
    join(__dirname, `../src/annotations/${className}.ts`),
    format(annotationDefinition(className, definition), {
      parser: "typescript"
    })
  );
});

writeFileSync(
  join(__dirname, `../src/annotations/ArticleDocument.ts`),
  format(annotationDefinition("ArticleDocument", definitions.ArticleDocument), {
    parser: "typescript"
  })
);

let annotations = ["ArticleDocument", ...components].sort();

writeFileSync(
  join(__dirname, `../src/annotations/index.ts`),
  format(
    `
// ⚠️ Generated via script; modifications may be overridden
${annotations
  .map(component => {
    return `import { ${component} } from "./${component}";`;
  })
  .join("\n")}

${annotations
  .map(component => {
    return `export { ${component} };`;
  })
  .join("\n")}

export default [${annotations.join(", ")}];
`,
    {
      parser: "typescript"
    }
  )
);

writeFileSync(
  join(__dirname, `../src/utils.ts`),
  format(
    `
// ⚠️ Generated via script; modifications may be overridden
import { ArticleStructure, Component, Text } from "./apple-news-format";
import { ${components.sort().join(", ")} } from "./annotations";

export function createAnnotation(start: number, end: number, component: Component) {
  switch (component.role) {
  ${components
    .map(name => {
      let component = definitions[name];
      return `${component.definitions.role.type
        .split(" | ")
        .map(role => {
          return `  case ${role}:`;
        })
        .join("\n")} {
    let { ${component.definitions.text ? "text, " : ""}${
        component.definitions.components ? "components, " : ""
      }...attributes } = component;
    return new ${name}({
      start,
      end,
      attributes
    });
  }`;
    })
    .join("\n")}
    default:
      throw new Error(\`🚨 No annotation was found that matched the role in \${JSON.stringify(component, null, 2)}\`);
  }
}

export function hasText(component: Component): component is Text {
  return [${components
    .filter(name => {
      return definitions[name].definitions.text;
    })
    .map(name => {
      let component = definitions[name];
      return component.definitions.role.type.split(" | ").join(", ");
    })
    .join(", ")}].indexOf(component.role) !== -1;
}

export function hasComponents(component: Component): component is ArticleStructure {
  return [${components
    .filter(name => {
      return definitions[name].definitions.components;
    })
    .map(name => {
      let component = definitions[name];
      return component.definitions.role.type.split(" | ").join(", ");
    })
    .join(", ")}].indexOf(component.role) !== -1;
}
`,
    {
      parser: "typescript"
    }
  )
);
