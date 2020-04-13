import { readdirSync, readFileSync } from "fs";
import { join } from "path";

export const md = readdirSync(__dirname)
  .filter((filename) => filename.endsWith(".md"))
  .map((filename) => readFileSync(join(__dirname, filename)).toString());
