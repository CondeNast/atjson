#!/usr/bin/env node
"use strict";

// Bootstrap copied into package adapters. Keep task policy in the app helper;
// this file only locates a verified app worktree and delegates discovery to it.
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");
const git = (cwd, ...args) =>
  execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    timeout: 10000,
    stdio: ["ignore", "pipe", "pipe"],
  }).trimEnd();
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const isApp = (root) =>
  /^(?:git@github\.com:|ssh:\/\/git@github\.com\/|https:\/\/github\.com\/)CondeNast\/copilot-app(?:\.git)?$/i.test(
    git(root, "remote", "get-url", "origin")
  );
function capable(root) {
  return (
    isApp(root) &&
    fs.existsSync(path.join(root, "scripts/agents/context.cjs")) &&
    ["agent:context", "agent:verify", "agent:check", "agent:status"].every(
      (name) => read(path.join(root, "package.json")).scripts?.[name]
    ) &&
    ["start", "feature", "bug", "test", "delivery"].every((skill) =>
      fs.existsSync(path.join(root, `.agents/skills/copilot-${skill}/SKILL.md`))
    )
  );
}
try {
  const root = git(process.cwd(), "rev-parse", "--show-toplevel");
  const pointer = path.resolve(
    root,
    git(root, "rev-parse", "--git-path", "copilot-agent-task.json")
  );
  const args = process.argv.slice(2);
  const selected = args.indexOf("--coordinator");
  let coordinator;
  if (fs.existsSync(pointer))
    coordinator = read(read(pointer).record).coordinator;
  else {
    const expected =
      selected >= 0
        ? args[selected + 1]
        : isApp(root)
        ? root
        : path.resolve(root, "../copilot-app");
    if (!expected || !isApp(expected))
      throw new Error(
        "The expected app checkout has the wrong repository identity."
      );
    const candidates = capable(expected)
      ? [expected]
      : git(expected, "worktree", "list", "--porcelain", "-z")
          .split("\0")
          .filter((line) => line.startsWith("worktree "))
          .map((line) => line.slice(9))
          .filter(capable);
    if (candidates.length !== 1)
      throw new Error(
        `Select one valid coordinator with --coordinator; found ${
          candidates.length
        }: ${candidates.join(", ")}`
      );
    coordinator = candidates[0];
  }
  if (!coordinator || !capable(coordinator))
    throw new Error(
      "The registered app coordinator is unavailable or lacks shared skills."
    );
  const result = spawnSync(
    process.execPath,
    [
      path.join(coordinator, "scripts/agents/context.cjs"),
      "--cwd",
      root,
      ...args,
    ],
    { cwd: root, stdio: "inherit" }
  );
  process.exitCode = result.status ?? 2;
} catch (error) {
  process.stderr.write(`Coordinator discovery blocked: ${error.message}\n`);
  process.exitCode = 2;
}
