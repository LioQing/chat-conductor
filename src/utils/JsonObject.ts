export type JsonValue =
  | string
  | number
  | boolean
  | JsonArray
  | JsonObject
  | null;

export interface JsonObject {
  [x: string]: JsonValue;
}

export const isJsonObject = (value: any): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export interface JsonArray extends Array<JsonValue> {}

export const isJsonArray = (value: any): value is JsonArray =>
  Array.isArray(value);

export const isJsonValue = (value: any): value is JsonValue =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean' ||
  value === null ||
  isJsonArray(value) ||
  isJsonObject(value);
