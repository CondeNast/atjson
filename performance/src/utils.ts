/* eslint-env node */
import * as crypto from "crypto";
import * as inspector from "inspector";

export function shuffle<T>(items: T[]): T[] {
  // No more items to shuffle
  if (items.length < 2) {
    return items;
  }

  let number = Math.floor(Math.random() * items.length);
  let otherItems = [...items.slice(0, number), ...items.slice(number + 1)];

  return [items[number], ...shuffle(otherItems)];
}

export function testId<T>(items: T[], original: T[]) {
  let indexes = items.map(item => original.indexOf(item));
  return crypto
    .createHash("md5")
    .update(indexes.join(""))
    .digest("hex");
}

export function enable(session: inspector.Session): Promise<void> {
  return new Promise((resolve, reject) => {
    session.post("Profiler.enable", err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function run(
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
