"use strict";

const Q = require("q");
const readFile = Q.denodeify(require("fs").readFile);
const resolve = require("path").resolve;

const SEVERITY = {
  patch: 0,
  minor: 1,
  major: 2,
  breaking: 2
};

module.exports = Q.all([
  readFile(resolve(__dirname, "./templates/template.hbs"), "utf-8"),
  readFile(resolve(__dirname, "./templates/header.hbs"), "utf-8"),
  readFile(resolve(__dirname, "./templates/commit.hbs"), "utf-8"),
  readFile(resolve(__dirname, "./emoji.csv"), "utf-8")
]).spread((template, header, commit, emojis) => {
  let config = emojis
    .toString()
    .split("\n")
    .slice(1)
    .reduce((groups, line) => {
      let [emoji, heading, versionBump, includeInChangelog] = line
        .split(",")
        .map(cell => cell.trim());
      groups[emoji] = {
        heading,
        versionBump,
        severity: SEVERITY[versionBump],
        includeInChangelog: includeInChangelog === "✅"
      };
      return groups;
    }, {});
  const opts = getWriterOpts(config);

  opts.mainTemplate = template;
  opts.headerPartial = header;
  opts.commitPartial = commit;

  return opts;
});

function getWriterOpts(config) {
  return {
    transform(commit, context) {
      let issues = [];
      let bestMatch = null;
      let breakingChanges = null;
      Object.keys(config).forEach(emoji => {
        let group = config[emoji];
        if (group.versionBump === "breaking") {
          breakingChanges = group;
        }
        if (
          commit.emojis &&
          commit.emojis.indexOf(emoji) !== -1 &&
          (bestMatch == null || group.severity < bestMatch.severity)
        ) {
          bestMatch = group;
        }
      });

      commit.notes.forEach(note => {
        note.title = breakingChanges.heading;
      });

      if (bestMatch == null || !bestMatch.includeInChangelog) {
        return null;
      }

      commit.type = bestMatch.heading;

      if (typeof commit.subject === `string`) {
        let url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl;
        if (url) {
          url = `${url}/issues/`;
          // Issue URLs.
          commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
            issues.push(issue);
            return `[#${issue}](${url}${issue})`;
          });
        }

        if (context.host) {
          // User URLs.
          commit.subject = commit.subject.replace(
            /\B@([a-z0-9](?:-?[a-z0-9]){0,38})/g,
            `[@$1](${context.host}/$1)`
          );
        }
      }

      // remove references that already appear in the subject
      commit.references = commit.references.filter(reference => {
        if (issues.indexOf(reference.issue) === -1) {
          return true;
        }

        return false;
      });

      return commit;
    },
    groupBy: "type",
    commitGroupsSort: "title",
    commitsSort: ["scope", "subject"],
    noteGroupsSort: "title"
  };
}
