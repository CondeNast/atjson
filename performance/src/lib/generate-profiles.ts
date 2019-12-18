/* eslint-env node */
import * as crypto from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import * as inspector from "inspector";
import { join } from "path";

function shuffle<T>(items: T[]): T[] {
  // No more items to shuffle
  if (items.length < 2) {
    return items;
  }

  let number = Math.floor(Math.random() * items.length);
  let otherItems = [...items.slice(0, number), ...items.slice(number + 1)];

  return [items[number], ...shuffle(otherItems)];
}

function testId() {
  return crypto.randomBytes(16).toString("hex");
}

function enable(session: inspector.Session): Promise<void> {
  return new Promise((resolve, reject) => {
    session.connect();
    session.post("Profiler.enable", err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function disable(session: inspector.Session): Promise<void> {
  return new Promise((resolve, reject) => {
    session.post("Profiler.disable", err => {
      if (err) reject(err);
      else {
        session.disconnect();
        resolve();
      }
    });
  });
}

function run(
  session: inspector.Session,
  cases: any[],
  runner: (testCase: any) => void
): Promise<inspector.Profiler.Profile | undefined> {
  return new Promise((resolve, reject) => {
    session.post("Profiler.start", err => {
      if (err) {
        reject(err);
      } else {
        for (let i = 0, len = cases.length; i < len; i++) {
          runner(cases[i]);
        }
        session.post("Profiler.stop", (err, { profile }) => {
          if (err != null) reject(err);
          else resolve(profile);
        });
      }
    });
  });
}

function writeProfile(directory: string, profile: any, id: string) {
  if (profile) {
    writeFileSync(join(directory, `${id}.cpuprofile`), JSON.stringify(profile));
  }
  return id;
}

export function generateCases<T>(cases: T[], times: number) {
  let runs: { [key: string]: T[] } = {};

  while (times--) {
    let shuffledCases = shuffle(cases);
    runs[testId()] = shuffledCases;
  }
  return runs;
}

export function generateProfile(
  id: string,
  cases: any,
  directory: string,
  runner: (testCase: any) => void
) {
  if (!existsSync(directory)) {
    mkdirSync(directory);
  }

  let session = new inspector.Session();
  return enable(session)
    .then(() => run(session, cases, runner))
    .then(profile => writeProfile(directory, profile, id))
    .then(
      id => disable(session).then(() => id),
      () => disable(session)
    );
}
