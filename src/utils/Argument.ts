import {
  JsonValue,
  JsonObject,
  isJsonArray,
  isJsonObject,
  JsonArray,
} from './JsonObject';

export interface Argument<T extends ArgumentValue = ArgumentValue>
  extends JsonObject {
  enabled: boolean;
  interpolated: string;
  default: T;
}

export type ArgumentValue =
  | string
  | number
  | boolean
  | null
  | ArgumentArray
  | ArgumentObject;

export interface ArgumentObject extends JsonObject {
  [x: string]: Argument;
}

export interface ArgumentArray extends JsonArray<Argument> {}

export const fromDefault = (def: JsonValue): Argument => {
  if (isJsonObject(def)) {
    const obj: ArgumentObject = {};

    for (const key in def) {
      if (Object.prototype.hasOwnProperty.call(def, key)) {
        obj[key] = fromDefault(def[key]);
      }
    }

    return {
      enabled: true,
      interpolated: '',
      default: obj,
    };
  }

  if (isJsonArray(def)) {
    return {
      enabled: true,
      interpolated: '',
      default: def.map((arg) => fromDefault(arg)),
    };
  }

  return {
    enabled: true,
    interpolated: '',
    default: def,
  };
};

export const toDefault = (args: Argument): JsonValue => {
  if (isJsonObject(args.default)) {
    const obj: JsonObject = {};

    for (const key in args.default) {
      if (Object.prototype.hasOwnProperty.call(args.default, key)) {
        obj[key] = toDefault(args.default[key]);
      }
    }

    return obj;
  }

  if (isJsonArray(args.default)) {
    return args.default.map((arg) => toDefault(arg));
  }

  return args.default;
};

export const getArgument = (
  arg: Argument,
  accessor: (string | number)[],
): Argument | undefined => {
  let current: Argument = arg;

  for (const key of accessor) {
    if (typeof key === 'string') {
      if (!isJsonObject(current.default)) {
        return undefined;
      }
      current = current.default[key];
    } else {
      if (!isJsonArray(current.default)) {
        return undefined;
      }
      current = current.default[key];
    }

    if (current === undefined) {
      return undefined;
    }
  }

  return current;
};

export const setArgument = (
  arg: Argument,
  accessor: (string | number)[],
  value: Argument,
): Argument => {
  const current = getArgument(arg, accessor);

  if (current === undefined) {
    console.error('Invalid accessor');
    return arg;
  }

  current.enabled = value.enabled;
  current.interpolated = value.interpolated;
  current.default = value.default;
  return arg;
};
