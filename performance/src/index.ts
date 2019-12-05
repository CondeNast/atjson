/* eslint-env node */
import * as crypto from "crypto";
import * as inspector from "inspector";
import { writeFileSync, mkdirSync, existsSync } from "fs";
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

function uuid<T>(items: T[], original: T[]) {
  let indexes = items.map(item => original.indexOf(item));
  return crypto
    .createHash("md5")
    .update(indexes.join(""))
    .digest("hex");
}

function enable(session: inspector.Session): Promise<void> {
  return new Promise((resolve, reject) => {
    session.post("Profiler.enable", err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function run(
  session: inspector.Session,
  method: () => void
): Promise<inspector.Profiler.Profile | undefined> {
  return new Promise((resolve, reject) => {
    session.post("Profiler.start", err => {
      if (err) {
        reject(err);
      } else {
        method();
        session.post("Profiler.stop", (err, { profile }) => {
          if (err != null) reject(err);
          else resolve(profile);
        });
      }
    });
  });
}

export async function profile<TestCase>(
  name: string,
  runCode: (testCase: TestCase) => void,
  testCases: TestCase[],
  times = 20
) {
  let session = new inspector.Session();
  let uniqueCaseOrders: { [key: string]: boolean } = {};
  session.connect();

  if (!existsSync(join(__dirname, "..", "profiles"))) {
    mkdirSync(join(__dirname, "..", "profiles"));
  }
  if (!existsSync(join(__dirname, "..", "profiles", name))) {
    mkdirSync(join(__dirname, "..", "profiles", name));
  }

  await enable(session);

  for (let runNumber = 0; runNumber < times; runNumber++) {
    let currentCases = shuffle(testCases);
    while (uniqueCaseOrders[uuid(currentCases, testCases)]) {
      currentCases = shuffle(testCases);
    }
    let id = uuid(currentCases, testCases);
    uniqueCaseOrders[id] = true;

    let profile = await run(session, () => {
      for (let i = 0, len = currentCases.length; i < len; i++) {
        runCode(currentCases[i]);
      }
    });
    writeFileSync(
      join(__dirname, "..", "profiles", name, `${id}.cpuprofile`),
      JSON.stringify(profile)
    );
  }

  session.disconnect();
}
