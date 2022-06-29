import { parseDocument } from "yaml";
import path from "path";
import fs from "fs/promises";

export async function validate(options: { path: string }) {
  let file = await fs.readFile(
    path.join(process.cwd(), ...options.path.split("/")),
    "utf-8"
  );
  let yaml = parseDocument(file.toString());
  let errors = {
    missing: [] as string[],
  };
  if (!yaml.has("name")) {
    errors.missing.push("name");
  }
  if (!yaml.has("version")) {
    errors.missing.push("version");
  }
  if (!yaml.has("schema")) {
    errors.missing.push("schema");
  }
  console.log(errors);

  return errors;
}
