"use strict";
var conventionalChangelogCore = require("conventional-changelog-core");
var preset = require("../");
var fs = require("fs");
var path = require("path");
var shell = require("shelljs");

describe("emoji preset", () => {
  it("should work if there is no semver tag", () => {
    shell.config.silent = true;
    shell.rm("-rf", "tmp");
    shell.mkdir("tmp");
    shell.cd("tmp");
    shell.mkdir("git-templates");
    shell.exec("git init --template=./git-templates");

    shell.exec(
      `git commit -m "✨👑✨ Make Annotations classes instead of JS objects (#54)\n\n🚨 Annotations are always vendor prefixed\n🚨 The schema for a document is a list of annotation classes" --allow-empty --no-gpg-sign`
    );
    shell.exec(
      `git commit -m "✨🛸✨ Add support for Unknown Annotations (#55)\nThis casts any annotations not identified in the schema list into an UnknownAnnotation. Unknown Annotations are AtJSON's form of Ruby's \`method_missing\`, with the added benefit that these annotations will be stored and updated in a document even after being updated." --allow-empty --no-gpg-sign`
    );
    shell.exec(
      `git commit -m "🐛🔍 Fix querying to work with Annotation classes (#56)" --allow-empty --no-gpg-sign`
    );
    shell.exec(
      `git commit -m "🌳 Rework the hierarchical text format to work with annotation classes (#59)" --allow-empty --no-gpg-sign`
    );
    shell.exec(
      `git commit -m "🐛🛰 Fix leading whitespace and tabs turning into code blocks (#53)" --allow-empty --no-gpg-sign`
    );
    shell.exec(
      `git commit -m "✨ Add support for horizontal rules, subscript, and superscript from Google Docs (#52)" --allow-empty --no-gpg-sign`
    );
    shell.exec(
      `git commit -m "📚 Add TypeDoc documentation (#45)" --allow-empty --no-gpg-sign`
    );
    shell.exec(
      `git commit -m "✨📈 Add Graphviz renderer" --allow-empty --no-gpg-sign`
    );
    shell.exec(
      `git commit -m "👩🏾‍⚖️ Add Apache 2.0 License" --allow-empty --no-gpg-sign`
    );
    shell.exec(`git commit -m "⏪ Undoing #45" --allow-empty --no-gpg-sign`);

    return new Promise((resolve, reject) => {
      let filename = path.resolve(__dirname, ".CHANGELOG.md");
      let results = new fs.createWriteStream(filename);
      conventionalChangelogCore({
        config: preset
      })
        .on("error", err => {
          reject(err);
        })
        .pipe(results);

      results.on("finish", () => {
        let changelog = fs.readFileSync(filename);
        fs.unlinkSync(filename);
        resolve(changelog.toString());
      });
    }).then(changelog => {
      expect(changelog).toEqual(expect.stringContaining("#54"));
      expect(changelog).toEqual(expect.stringContaining("### ✨ New Features"));
      expect(changelog).toEqual(expect.stringContaining("### 🐛 Fixes"));
      expect(changelog).toEqual(
        expect.stringContaining("### ⚖️ Licensing Changes")
      );
      expect(changelog).toEqual(
        expect.stringContaining("### 🚨 Breaking Changes")
      );

      expect(changelog).not.toEqual(expect.stringContaining("CLEANUP"));
      expect(changelog).not.toEqual(expect.stringContaining("FEATURE"));
      expect(changelog).not.toEqual(expect.stringContaining("Bad"));
      expect(changelog).not.toEqual(expect.stringContaining("#45"));
    });
  });
});
