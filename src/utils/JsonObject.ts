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

export interface JsonArray<T extends JsonValue = JsonValue> extends Array<T> {}

export const isJsonArray = (value: any): value is JsonArray =>
  Array.isArray(value);

export const isJsonValue = (value: any): value is JsonValue =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean' ||
  value === null ||
  isJsonArray(value) ||
  isJsonObject(value);

export const JsonTypeName = (value: JsonValue): string => {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  if (typeof value === 'object') {
    return 'object';
  }
  return typeof value;
};
