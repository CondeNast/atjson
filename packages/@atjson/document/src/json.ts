/* eslint @typescript-eslint/no-empty-interface: 0 */
export interface Dictionary<T> {
  [key: string]: T | undefined;
}

export type JSON = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject extends Dictionary<JSON> {}
export interface JSONArray extends Array<JSON> {}

export function JSONEquals(left: JSON | undefined, right: JSON | undefined) {
  // covers all primitives
  if (left == right) {
    return true;
  }

  // if either is null then we already know they aren't equal from above;
  // but this narrows the type to simplify things later
  if (left == null || right == null) {
    return false;
  }

  // arrays are equal if they're the same length and every position is equal
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false;
    }

    for (let i = 0; i < left.length; i++) {
      if (!JSONEquals(left[i], right[i])) {
        return false;
      }
    }

    return true;
  }

  // objects are equal if they have the same keys and every key has the same value
  if (
    typeof left === "object" &&
    typeof right === "object" &&
    !(Array.isArray(left) || Array.isArray(right))
  ) {
    let leftKeys = Object.keys(left);

    if (leftKeys.length !== Object.keys(right).length) {
      return false;
    }

    for (let key of leftKeys) {
      if (!Object.prototype.hasOwnProperty.call(right, key)) {
        return false;
      }

      if (!JSONEquals(left[key], right[key])) {
        return false;
      }
    }

    return true;
  }

  // the arguments have different types
  return false;
}
