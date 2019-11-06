/* eslint @typescript-eslint/no-empty-interface: 0 */
export interface Dictionary<T> {
  [key: string]: T | undefined;
}

export type JSON = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject extends Dictionary<JSON> {}
export interface JSONArray extends Array<JSON> {}

export default JSON;
