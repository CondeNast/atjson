import { parse } from "yaml";
import path from "path";
import fs from "fs/promises";
import { format } from "prettier";

function classify(text: string) {
  return text
    .split("-")
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join("");
}

function dasherize(text: string) {
  return text
    .replace(/([a-z])([A-Z])/g, (...args) => `${args[1]}-${args[2]}`)
    .split(/\s+/g)
    .join("-")
    .toLowerCase();
}

const TYPE_MAP = {
  string: "string",
  int: "number",
  float: "number",
  boolean: "boolean",
  date: "Date",
};

export async function generateTypes(options: {
  path: string;
  out: string;
  format: "javascript" | "typescript";
  dryRun: boolean;
}) {
  let file = await fs.readFile(
    path.join(process.cwd(), ...options.path.split("/")),
    "utf-8"
  );
  let yaml = parse(file.toString());

  for (let key in yaml.schema) {
    let annotation = yaml.schema[key];
    let type =
      annotation.type === "mark"
        ? "InlineAnnotation"
        : annotation.type === "block"
        ? "BlockAnnotation"
        : "ObjectAnnotation";

    let lines = [`import { ${type} } from "@atjson/document";`, ``];
    if (annotation.description) {
      lines.push(`/**`, ` * ${annotation.description}`, ` */`);
    }
    let name = annotation.name ?? annotation.key;
    lines.push(`export class ${classify(name)} extends ${type}`);

    if (annotation.data) {
      if (options.format === "javascript") {
        continue;
      }
      lines.push(`<{`);

      for (let key in annotation.data) {
        let attribute = annotation.data[key];
        let typeName = attribute.type;
        let isArray = typeName.endsWith("[]");
        if (isArray) {
          typeName = typeName.slice(0, typeName.length - 2);
        }
        if (!(typeName in TYPE_MAP)) {
          console.error(`${typeName} is not a valid attribute type.`);
          return;
        }
        if (!attribute.required) {
          key = `${key}?`;
        }
        let type = TYPE_MAP[typeName as keyof typeof TYPE_MAP];
        if (isArray) {
          type = `${type}[]`;
        }
        if (attribute.description) {
          lines.push(`/**`, `* ${attribute.description}`, `*/`);
        }
        lines.push(`${key}: ${type}`);
      }
      lines.push(`}>`);
    }

    lines.push(
      `{`,
      `  static vendorPrefix = "${dasherize(yaml.name)}";`,
      `  static type = "${key}";`,
      `}`
    );

    let output = format(lines.join("\n"), {
      parser: options.format === "javascript" ? "babel" : "typescript",
    });
    let filename = `${annotation.name}.${
      options.format === "javascript" ? "js" : "ts"
    }`;

    if (options.dryRun) {
      console.log(output);
    } else {
      await fs.writeFile(
        path.join(process.cwd(), ...options.out.split("/"), filename),
        output
      );
    }
  }

  return yaml;
}
