/* tslint:disable interface-name */
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export interface JSONObject {
  [member: string]: JSONValue;
}
export interface JSONArray extends Array<JSONValue> {}
