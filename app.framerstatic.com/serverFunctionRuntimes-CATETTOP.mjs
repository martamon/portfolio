import"https://martamon.github.io/portfolio/app.framerstatic.com/chunk-WLHSDIGQ.mjs";var n=`// ../../../node_modules/devalue/src/constants.js
var UNDEFINED = -1;
var HOLE = -2;
var NAN = -3;
var POSITIVE_INFINITY = -4;
var NEGATIVE_INFINITY = -5;
var NEGATIVE_ZERO = -6;
var SPARSE = -7;
var MAX_ARRAY_LEN = 2 ** 32 - 1;
var MAX_ARRAY_INDEX = MAX_ARRAY_LEN - 1;

// ../../../node_modules/devalue/src/utils.js
var DevalueError = class extends Error {
  /**
   * @param {string} message
   * @param {string[]} keys
   * @param {any} [value] - The value that failed to be serialized
   * @param {any} [root] - The root value being serialized
   */
  constructor(message, keys, value, root) {
    super(message);
    this.name = "DevalueError";
    this.path = keys.join("");
    this.value = value;
    this.root = root;
  }
};
var object_proto_names = /* @__PURE__ */ Object.getOwnPropertyNames(Object.prototype).sort().join("\\0");
function is_plain_object(thing) {
  const proto = Object.getPrototypeOf(thing);
  return proto === Object.prototype || proto === null || Object.getPrototypeOf(proto) === null || Object.getOwnPropertyNames(proto).sort().join("\\0") === object_proto_names;
}
function get_type(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function is_buffer(thing) {
  return typeof Buffer !== "undefined" && Buffer.isBuffer(thing);
}
function get_escaped_char(char) {
  switch (char) {
    case '"':
      return '\\\\"';
    case "<":
      return "\\\\u003C";
    case "\\\\":
      return "\\\\\\\\";
    case "\\n":
      return "\\\\n";
    case "\\r":
      return "\\\\r";
    case "	":
      return "\\\\t";
    case "\\b":
      return "\\\\b";
    case "\\f":
      return "\\\\f";
    case "\\u2028":
      return "\\\\u2028";
    case "\\u2029":
      return "\\\\u2029";
    default:
      return char < " " ? \`\\\\u\${char.charCodeAt(0).toString(16).padStart(4, "0")}\` : "";
  }
}
function stringify_string(str) {
  let result = "";
  let last_pos = 0;
  const len = str.length;
  for (let i = 0; i < len; i += 1) {
    const char = str[i];
    const replacement = get_escaped_char(char);
    if (replacement) {
      result += str.slice(last_pos, i) + replacement;
      last_pos = i + 1;
    }
  }
  return \`"\${last_pos === 0 ? str : result + str.slice(last_pos)}"\`;
}
function enumerable_symbols(object) {
  return Object.getOwnPropertySymbols(object).filter(
    (symbol) => Object.getOwnPropertyDescriptor(object, symbol).enumerable
  );
}
var is_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
function stringify_key(key) {
  return is_identifier.test(key) ? "." + key : "[" + JSON.stringify(key) + "]";
}
function is_valid_array_index(n) {
  if (!Number.isInteger(n)) return false;
  if (n < 0) return false;
  if (n > MAX_ARRAY_INDEX) return false;
  return true;
}
function is_valid_array_len(n) {
  if (!Number.isInteger(n)) return false;
  if (n < 0) return false;
  if (n > MAX_ARRAY_LEN) return false;
  return true;
}
function is_valid_array_index_string(s) {
  if (s.length === 0) return false;
  if (s.length > 1 && s.charCodeAt(0) === 48) return false;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 48 || c > 57) return false;
  }
  return is_valid_array_index(+s);
}
function array_index_cut(keys) {
  for (var i = keys.length - 1; i >= 0; i--) {
    if (is_valid_array_index_string(keys[i])) {
      break;
    }
  }
  return i + 1;
}
function valid_array_indices(array) {
  const keys = Object.keys(array);
  keys.length = array_index_cut(keys);
  return keys;
}

// ../../../node_modules/devalue/src/base64.js
function encode_native(array_buffer) {
  return new Uint8Array(array_buffer).toBase64();
}
function decode_native(base64) {
  return Uint8Array.fromBase64(base64).buffer;
}
function encode_buffer(array_buffer) {
  return Buffer.from(array_buffer).toString("base64");
}
function decode_buffer(base64) {
  return Uint8Array.from(Buffer.from(base64, "base64")).buffer;
}
function encode_legacy(array_buffer) {
  const array = new Uint8Array(array_buffer);
  let binary = "";
  const chunk_size = 32768;
  for (let i = 0; i < array.length; i += chunk_size) {
    const chunk = array.subarray(i, i + chunk_size);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}
function decode_legacy(base64) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const array = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    array[i] = binary_string.charCodeAt(i);
  }
  return array.buffer;
}
var native = typeof Uint8Array.fromBase64 === "function";
var buffer = typeof process === "object" && process.versions?.node !== void 0;
var encode64 = native ? encode_native : buffer ? encode_buffer : encode_legacy;
var decode64 = native ? decode_native : buffer ? decode_buffer : decode_legacy;

// ../../../node_modules/devalue/src/operations.js
function merge_operations(defaults, overrides) {
  if (!overrides) return defaults;
  const merged = (
    /** @type {T} */
    {}
  );
  for (
    const key of
    /** @type {(keyof T)[]} */
    Object.keys(defaults)
  ) {
    merged[key] = overrides[key] ?? defaults[key];
  }
  return merged;
}
var NOT_PLAIN = /* @__PURE__ */ Object.freeze({ kind: "not-plain" });
var SYMBOL_KEYS = /* @__PURE__ */ Object.freeze({ kind: "symbol-keys" });
var stringify_operations = {
  identify: (value) => value,
  typeOf: (value) => value === null ? "null" : typeof value,
  toPrimitive: (value) => value,
  tagOf: (value) => get_type(value),
  isThenable: (value) => typeof value.then === "function",
  toPromise: (thenable) => Promise.resolve(thenable),
  unbox: (boxed) => boxed.valueOf(),
  toISOString: (date) => isNaN(date.getDate()) ? "" : date.toISOString(),
  toStringValue: (value) => value.toString(),
  regExpInfo: (regexp) => ({ source: regexp.source, flags: regexp.flags }),
  valuesOf: (set) => set,
  entriesOf: (map) => map,
  viewInfo: (view) => {
    if (is_buffer(view)) view = new Uint8Array(view);
    return {
      buffer: view.buffer,
      byteOffset: view.byteOffset,
      byteLength: view.byteLength,
      length: view.length,
      bufferByteLength: view.buffer.byteLength
    };
  },
  toArrayBuffer: (buffer2) => buffer2,
  lengthOf: (array) => array.length,
  hasOwn: (value, key) => Object.hasOwn(value, key),
  indicesOf: (array) => valid_array_indices(array),
  shapeOf: (value) => {
    if (!is_plain_object(value)) return NOT_PLAIN;
    if (enumerable_symbols(value).length > 0) return SYMBOL_KEYS;
    return {
      kind: Object.getPrototypeOf(value) === null ? "null-proto" : "plain",
      keys: Object.keys(value)
    };
  },
  get: (value, key) => value[key]
};
var default_stringify_operations = /* @__PURE__ */ Object.freeze(stringify_operations);
var array_buffer_byte_length = /* @__PURE__ */ (() => Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get)();
var shared_array_buffer_byte_length = /* @__PURE__ */ (() => typeof SharedArrayBuffer === "undefined" ? void 0 : Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength").get)();
var parse_operations = {
  fromPrimitive: (primitive) => primitive,
  fromISOString: (iso) => new Date(iso),
  fromStringValue: (tag, text) => {
    if (tag === "URL") return new URL(text);
    if (tag === "URLSearchParams") return new URLSearchParams(text);
    return Temporal[tag.slice(9)].from(text);
  },
  fromArrayBuffer: (buffer2) => buffer2,
  fromRegExpInfo: (source, flags) => new RegExp(source, flags),
  fromViewInfo: (tag, buffer2, byteOffset, length) => {
    try {
      array_buffer_byte_length.call(buffer2);
    } catch (error) {
      if (!shared_array_buffer_byte_length) throw error;
      shared_array_buffer_byte_length.call(buffer2);
    }
    const Constructor = (
      /** @type {any} */
      globalThis[tag]
    );
    return byteOffset !== void 0 ? new Constructor(buffer2, byteOffset, length) : new Constructor(buffer2);
  },
  box: (value) => Object(value),
  createArray: (length) => new Array(length),
  createSparseArray: (length) => {
    const array = [];
    array[MAX_ARRAY_INDEX] = void 0;
    delete array[MAX_ARRAY_INDEX];
    array.length = length;
    return array;
  },
  createObject: () => ({}),
  createNullPrototypeObject: () => /* @__PURE__ */ Object.create(null),
  createSet: () => /* @__PURE__ */ new Set(),
  createMap: () => /* @__PURE__ */ new Map(),
  set: (target, key, value) => {
    target[key] = value;
  },
  addValue: (set, value) => {
    set.add(value);
  },
  addEntry: (map, key, value) => {
    map.set(key, value);
  }
};
var default_parse_operations = /* @__PURE__ */ Object.freeze(parse_operations);

// ../../../node_modules/devalue/src/parse.js
function parse(serialized, revivers, options) {
  return unflatten(JSON.parse(serialized), revivers, options);
}
function unflatten(parsed, revivers, options) {
  const ops = merge_operations(default_parse_operations, options?.operations);
  if (typeof parsed === "number") return hydrate(parsed, true);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Invalid input");
  }
  const values = (
    /** @type {any[]} */
    parsed
  );
  const hydrated = Array(values.length);
  let hydrating = null;
  function hydrate(index, standalone = false) {
    if (index === UNDEFINED) return ops.fromPrimitive(void 0);
    if (index === NAN) return ops.fromPrimitive(NaN);
    if (index === POSITIVE_INFINITY) return ops.fromPrimitive(Infinity);
    if (index === NEGATIVE_INFINITY) return ops.fromPrimitive(-Infinity);
    if (index === NEGATIVE_ZERO) return ops.fromPrimitive(-0);
    if (standalone || typeof index !== "number") {
      throw new Error(\`Invalid input\`);
    }
    if (index in hydrated) return hydrated[index];
    if (index >= values.length) {
      throw new Error(\`Invalid input\`);
    }
    const value = values[index];
    if (!value || typeof value !== "object") {
      hydrated[index] = ops.fromPrimitive(value);
    } else if (Array.isArray(value)) {
      if (typeof value[0] === "string") {
        const type = value[0];
        const reviver = revivers && Object.hasOwn(revivers, type) ? revivers[type] : void 0;
        if (reviver) {
          let i = value[1];
          if (typeof i !== "number") {
            i = values.push(value[1]) - 1;
          }
          if (Object.hasOwn(hydrated, i)) {
            return hydrated[index] = reviver(hydrated[i]);
          }
          hydrating ??= /* @__PURE__ */ new Set();
          if (hydrating.has(i)) {
            throw new Error("Invalid circular reference");
          }
          hydrating.add(i);
          hydrated[index] = reviver(hydrate(i));
          hydrating.delete(i);
          return hydrated[index];
        }
        switch (type) {
          case "Date":
            hydrated[index] = ops.fromISOString(value[1]);
            break;
          case "Set":
            const set = ops.createSet();
            hydrated[index] = set;
            for (let i = 1; i < value.length; i += 1) {
              ops.addValue(set, hydrate(value[i]));
            }
            break;
          case "Map":
            const map = ops.createMap();
            hydrated[index] = map;
            for (let i = 1; i < value.length; i += 2) {
              ops.addEntry(map, hydrate(value[i]), hydrate(value[i + 1]));
            }
            break;
          case "RegExp":
            hydrated[index] = ops.fromRegExpInfo(value[1], value[2]);
            break;
          case "Object": {
            const wrapped_index = value[1];
            if (typeof values[wrapped_index] === "object" && values[wrapped_index][0] !== "BigInt") {
              throw new Error("Invalid input");
            }
            hydrated[index] = ops.box(hydrate(wrapped_index));
            break;
          }
          case "BigInt":
            hydrated[index] = ops.fromPrimitive(BigInt(value[1]));
            break;
          case "null":
            const obj = ops.createNullPrototypeObject();
            hydrated[index] = obj;
            for (let i = 1; i < value.length; i += 2) {
              const key = value[i];
              if (typeof key !== "string") {
                throw new Error("Cannot parse an object with a non-string key");
              }
              if (key === "__proto__") {
                throw new Error("Cannot parse an object with a \`__proto__\` property");
              }
              ops.set(obj, key, hydrate(value[i + 1]));
            }
            break;
          case "Int8Array":
          case "Uint8Array":
          case "Uint8ClampedArray":
          case "Int16Array":
          case "Uint16Array":
          case "Float16Array":
          case "Int32Array":
          case "Uint32Array":
          case "Float32Array":
          case "Float64Array":
          case "BigInt64Array":
          case "BigUint64Array":
          case "DataView": {
            if (values[value[1]][0] !== "ArrayBuffer") {
              throw new Error("Invalid data");
            }
            const buffer2 = hydrate(value[1]);
            hydrated[index] = ops.fromViewInfo(type, buffer2, value[2], value[3]);
            break;
          }
          case "ArrayBuffer": {
            const base64 = value[1];
            if (typeof base64 !== "string") {
              throw new Error("Invalid ArrayBuffer encoding");
            }
            hydrated[index] = ops.fromArrayBuffer(decode64(base64));
            break;
          }
          case "URL":
          case "URLSearchParams":
          case "Temporal.Duration":
          case "Temporal.Instant":
          case "Temporal.PlainDate":
          case "Temporal.PlainTime":
          case "Temporal.PlainDateTime":
          case "Temporal.PlainMonthDay":
          case "Temporal.PlainYearMonth":
          case "Temporal.ZonedDateTime": {
            hydrated[index] = ops.fromStringValue(type, value[1]);
            break;
          }
          default:
            throw new Error(\`Unknown type \${type}\`);
        }
      } else if (value[0] === SPARSE) {
        const len = value[1];
        if (!is_valid_array_len(len)) {
          throw new Error("Invalid input");
        }
        const array = ops.createSparseArray(len);
        hydrated[index] = array;
        for (let i = 2; i < value.length; i += 2) {
          const idx = value[i];
          if (!is_valid_array_index(idx) || idx >= len) {
            throw new Error("Invalid input");
          }
          ops.set(array, idx, hydrate(value[i + 1]));
        }
      } else {
        const array = ops.createArray(value.length);
        hydrated[index] = array;
        for (let i = 0; i < value.length; i += 1) {
          const n = value[i];
          if (n === HOLE) continue;
          ops.set(array, i, hydrate(n));
        }
      }
    } else {
      const object = ops.createObject();
      hydrated[index] = object;
      for (const key of Object.keys(value)) {
        if (key === "__proto__") {
          throw new Error("Cannot parse an object with a \`__proto__\` property");
        }
        ops.set(object, key, hydrate(value[key]));
      }
    }
    return hydrated[index];
  }
  return hydrate(0);
}

// ../../../node_modules/devalue/src/stringify.js
function stringify(value, reducers, options) {
  const stringified = run(false, value, reducers, options);
  return typeof stringified === "string" ? stringified : \`[\${stringified.join(",")}]\`;
}
function run(async, value, reducers, options) {
  const ops = merge_operations(default_stringify_operations, options?.operations);
  const stringified = [];
  const indexes = /* @__PURE__ */ new Map();
  const custom = [];
  if (reducers) {
    for (const key of Object.getOwnPropertyNames(reducers)) {
      custom.push({ key, fn: reducers[key] });
    }
  }
  const keys = [];
  let p = 0;
  function flatten(thing, index2) {
    const type = ops.typeOf(thing);
    if (type === "undefined") return UNDEFINED;
    let number;
    if (type === "number") {
      number = /** @type {number} */
      ops.toPrimitive(thing);
      if (Number.isNaN(number)) return NAN;
      if (number === Infinity) return POSITIVE_INFINITY;
      if (number === -Infinity) return NEGATIVE_INFINITY;
      if (number === 0 && 1 / number < 0) return NEGATIVE_ZERO;
    }
    const id = ops.identify(thing);
    if (indexes.has(id)) return (
      /** @type {number} */
      indexes.get(id)
    );
    index2 ??= p++;
    indexes.set(id, index2);
    for (const { key, fn } of custom) {
      const value2 = fn(thing);
      if (value2) {
        stringified[index2] = \`["\${key}",\${flatten(value2)}]\`;
        return index2;
      }
    }
    if (type === "function") {
      throw new DevalueError(\`Cannot stringify a function\`, keys, thing, value);
    } else if (type === "symbol") {
      throw new DevalueError(\`Cannot stringify a Symbol primitive\`, keys, thing, value);
    }
    let str = "";
    if (type !== "object") {
      str = stringify_primitive(type === "number" ? number : ops.toPrimitive(thing));
    } else if (ops.isThenable(thing)) {
      if (!async) {
        throw new DevalueError(
          \`Cannot stringify a Promise or thenable \\u2014 use stringifyAsync instead\`,
          keys,
          thing,
          value
        );
      }
      str = ops.toPromise(thing).then((value2) => {
        const i = flatten(value2, index2);
        if (i < 0) stringified[index2] = i;
      });
      str.catch(() => {
      });
    } else {
      const tag = ops.tagOf(thing);
      switch (tag) {
        case "Number":
        case "String":
        case "Boolean":
        case "BigInt":
          str = \`["Object",\${flatten(ops.unbox(thing))}]\`;
          break;
        case "Date":
          str = \`["Date","\${ops.toISOString(thing)}"]\`;
          break;
        case "URL":
          str = \`["URL",\${stringify_string(ops.toStringValue(thing))}]\`;
          break;
        case "URLSearchParams":
          str = \`["URLSearchParams",\${stringify_string(ops.toStringValue(thing))}]\`;
          break;
        case "RegExp":
          const { source, flags } = ops.regExpInfo(thing);
          str = flags ? \`["RegExp",\${stringify_string(source)},"\${flags}"]\` : \`["RegExp",\${stringify_string(source)}]\`;
          break;
        case "Array": {
          let mostly_dense = false;
          const length = ops.lengthOf(thing);
          str = "[";
          for (let i = 0; i < length; i += 1) {
            if (i > 0) str += ",";
            if (ops.hasOwn(thing, i)) {
              keys.push(\`[\${i}]\`);
              str += flatten(ops.get(thing, i));
              keys.pop();
            } else if (mostly_dense) {
              str += HOLE;
            } else {
              const populated_keys = ops.indicesOf(thing);
              const population = populated_keys.length;
              const d = String(length).length;
              const hole_cost = (length - population) * 3;
              const sparse_cost = 4 + d + population * (d + 1);
              if (hole_cost > sparse_cost) {
                str = "[" + SPARSE + "," + length;
                for (let j = 0; j < populated_keys.length; j++) {
                  const key = populated_keys[j];
                  keys.push(\`[\${key}]\`);
                  str += "," + key + "," + flatten(ops.get(thing, key));
                  keys.pop();
                }
                break;
              } else {
                mostly_dense = true;
                str += HOLE;
              }
            }
          }
          str += "]";
          break;
        }
        case "Set":
          str = '["Set"';
          for (const value2 of ops.valuesOf(thing)) {
            str += \`,\${flatten(value2)}\`;
          }
          str += "]";
          break;
        case "Map":
          str = '["Map"';
          for (const [key, value2] of ops.entriesOf(thing)) {
            const key_type = ops.typeOf(key);
            const key_is_primitive = key_type !== "object" && key_type !== "function" && key_type !== "symbol";
            keys.push(
              \`.get(\${key_is_primitive ? stringify_primitive(ops.toPrimitive(key)) : "..."})\`
            );
            str += \`,\${flatten(key)},\${flatten(value2)}\`;
            keys.pop();
          }
          str += "]";
          break;
        case "Int8Array":
        case "Uint8Array":
        case "Uint8ClampedArray":
        case "Int16Array":
        case "Uint16Array":
        case "Float16Array":
        case "Int32Array":
        case "Uint32Array":
        case "Float32Array":
        case "Float64Array":
        case "BigInt64Array":
        case "BigUint64Array": {
          const info = ops.viewInfo(thing);
          str = '["' + tag + '",' + flatten(info.buffer);
          if (info.byteLength !== info.bufferByteLength) {
            str += \`,\${info.byteOffset},\${info.length}\`;
          }
          str += "]";
          break;
        }
        case "DataView": {
          const info = ops.viewInfo(thing);
          str = '["' + tag + '",' + flatten(info.buffer);
          if (info.byteLength !== info.bufferByteLength) {
            str += \`,\${info.byteOffset},\${info.byteLength}\`;
          }
          str += "]";
          break;
        }
        case "ArrayBuffer": {
          const base64 = encode64(ops.toArrayBuffer(thing));
          str = \`["ArrayBuffer","\${base64}"]\`;
          break;
        }
        case "Temporal.Duration":
        case "Temporal.Instant":
        case "Temporal.PlainDate":
        case "Temporal.PlainTime":
        case "Temporal.PlainDateTime":
        case "Temporal.PlainMonthDay":
        case "Temporal.PlainYearMonth":
        case "Temporal.ZonedDateTime":
          str = \`["\${tag}",\${stringify_string(ops.toStringValue(thing))}]\`;
          break;
        default: {
          const shape = ops.shapeOf(thing);
          if (shape.kind === "not-plain") {
            throw new DevalueError(\`Cannot stringify arbitrary non-POJOs\`, keys, thing, value);
          }
          if (shape.kind === "symbol-keys") {
            throw new DevalueError(\`Cannot stringify POJOs with symbolic keys\`, keys, thing, value);
          }
          if (shape.kind === "null-proto") {
            str = '["null"';
            for (const key of shape.keys) {
              if (key === "__proto__") {
                throw new DevalueError(
                  \`Cannot stringify objects with __proto__ keys\`,
                  keys,
                  thing,
                  value
                );
              }
              keys.push(stringify_key(key));
              str += \`,\${stringify_string(key)},\${flatten(ops.get(thing, key))}\`;
              keys.pop();
            }
            str += "]";
          } else {
            str = "{";
            let started = false;
            for (const key of shape.keys) {
              if (key === "__proto__") {
                throw new DevalueError(
                  \`Cannot stringify objects with __proto__ keys\`,
                  keys,
                  thing,
                  value
                );
              }
              if (started) str += ",";
              started = true;
              keys.push(stringify_key(key));
              str += \`\${stringify_string(key)}:\${flatten(ops.get(thing, key))}\`;
              keys.pop();
            }
            str += "}";
          }
        }
      }
    }
    stringified[index2] = str;
    return index2;
  }
  const index = flatten(value);
  if (index < 0) return \`\${index}\`;
  return stringified;
}
function stringify_primitive(thing) {
  const type = typeof thing;
  if (type === "string") return stringify_string(thing);
  if (thing === void 0) return UNDEFINED.toString();
  if (thing === 0 && 1 / thing < 0) return NEGATIVE_ZERO.toString();
  if (type === "bigint") return \`["BigInt","\${thing}"]\`;
  return String(thing);
}

// src/utils/typeChecks.ts
function isString(value) {
  return typeof value === "string";
}
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// src/modules/serverFunctions/bundled/protocol.ts
var contentType = "text/plain;charset=UTF-8";
function isServerFunctionResultResponse(value) {
  return isObject(value) && value.type === "result" && Object.hasOwn(value, "result");
}
function isServerFunctionErrorResponse(value) {
  return isObject(value) && value.type === "error" && isObject(value.error) && isString(value.error.name) && isString(value.error.message);
}
function isServerFunctionResponse(value) {
  return isServerFunctionResultResponse(value) || isServerFunctionErrorResponse(value);
}
function parseServerFunctionResponse(text) {
  try {
    const value = parse(text);
    if (isServerFunctionResponse(value)) {
      return value;
    }
  } catch {
  }
  return void 0;
}

// src/modules/serverFunctions/bundled/clientRuntime.ts?bundle
var ServerFunctionError = class extends Error {
  functionName;
  constructor({ name, message, functionName }) {
    super(message);
    this.name = name;
    this.functionName = functionName;
  }
};
function parseModuleSave(moduleUrl) {
  const [moduleId, saveId] = new URL(moduleUrl).pathname.split("/").slice(-3);
  if (!moduleId || !saveId) return void 0;
  return { moduleId, saveId };
}
function createServerFunction(moduleUrl, functionName) {
  return async (...args) => {
    const moduleSave = parseModuleSave(moduleUrl);
    if (!moduleSave) {
      throw new ServerFunctionError({
        name: "ServerFunctionError",
        message: \`Server function \\u201C\${functionName}\\u201D can\\u2019t be called from \${moduleUrl}\`,
        functionName
      });
    }
    const invoke = globalThis.__framer_invokeServerFunction;
    if (!invoke) {
      throw new ServerFunctionError({
        name: "ServerFunctionError",
        message: \`Server functions aren\\u2019t available here, so \\u201C\${functionName}\\u201D can\\u2019t be called\`,
        functionName
      });
    }
    const serverFunctionRequest = {
      name: functionName,
      args
    };
    const body = stringify(serverFunctionRequest);
    let response;
    try {
      response = await invoke(moduleSave.moduleId, moduleSave.saveId, {
        method: "POST",
        headers: { "content-type": contentType },
        body
      });
    } catch (error) {
      throw new ServerFunctionError({
        name: "NetworkError",
        message: \`Could not reach server function \\u201C\${functionName}\\u201D: \${error instanceof Error ? error.message : String(error)}\`,
        functionName
      });
    }
    let text;
    try {
      text = await response.text();
    } catch (error) {
      throw new ServerFunctionError({
        name: "NetworkError",
        message: \`Could not read the response of server function \\u201C\${functionName}\\u201D: \${error instanceof Error ? error.message : String(error)}\`,
        functionName
      });
    }
    const serverFunctionResponse = parseServerFunctionResponse(text);
    if (!serverFunctionResponse) {
      throw new ServerFunctionError({
        name: "ServerFunctionError",
        message: \`Server function \\u201C\${functionName}\\u201D returned an invalid response (HTTP \${response.status})\`,
        functionName
      });
    }
    if (serverFunctionResponse.type === "error") {
      throw new ServerFunctionError({
        ...serverFunctionResponse.error,
        functionName
      });
    }
    return serverFunctionResponse.result;
  };
}
export {
  ServerFunctionError,
  createServerFunction
};
`;var e=`// ../../../node_modules/devalue/src/constants.js
var UNDEFINED = -1;
var HOLE = -2;
var NAN = -3;
var POSITIVE_INFINITY = -4;
var NEGATIVE_INFINITY = -5;
var NEGATIVE_ZERO = -6;
var SPARSE = -7;
var MAX_ARRAY_LEN = 2 ** 32 - 1;
var MAX_ARRAY_INDEX = MAX_ARRAY_LEN - 1;

// ../../../node_modules/devalue/src/utils.js
var DevalueError = class extends Error {
  /**
   * @param {string} message
   * @param {string[]} keys
   * @param {any} [value] - The value that failed to be serialized
   * @param {any} [root] - The root value being serialized
   */
  constructor(message, keys, value, root) {
    super(message);
    this.name = "DevalueError";
    this.path = keys.join("");
    this.value = value;
    this.root = root;
  }
};
var object_proto_names = /* @__PURE__ */ Object.getOwnPropertyNames(Object.prototype).sort().join("\\0");
function is_plain_object(thing) {
  const proto = Object.getPrototypeOf(thing);
  return proto === Object.prototype || proto === null || Object.getPrototypeOf(proto) === null || Object.getOwnPropertyNames(proto).sort().join("\\0") === object_proto_names;
}
function get_type(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function is_buffer(thing) {
  return typeof Buffer !== "undefined" && Buffer.isBuffer(thing);
}
function get_escaped_char(char) {
  switch (char) {
    case '"':
      return '\\\\"';
    case "<":
      return "\\\\u003C";
    case "\\\\":
      return "\\\\\\\\";
    case "\\n":
      return "\\\\n";
    case "\\r":
      return "\\\\r";
    case "	":
      return "\\\\t";
    case "\\b":
      return "\\\\b";
    case "\\f":
      return "\\\\f";
    case "\\u2028":
      return "\\\\u2028";
    case "\\u2029":
      return "\\\\u2029";
    default:
      return char < " " ? \`\\\\u\${char.charCodeAt(0).toString(16).padStart(4, "0")}\` : "";
  }
}
function stringify_string(str) {
  let result = "";
  let last_pos = 0;
  const len = str.length;
  for (let i = 0; i < len; i += 1) {
    const char = str[i];
    const replacement = get_escaped_char(char);
    if (replacement) {
      result += str.slice(last_pos, i) + replacement;
      last_pos = i + 1;
    }
  }
  return \`"\${last_pos === 0 ? str : result + str.slice(last_pos)}"\`;
}
function enumerable_symbols(object) {
  return Object.getOwnPropertySymbols(object).filter(
    (symbol) => Object.getOwnPropertyDescriptor(object, symbol).enumerable
  );
}
var is_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
function stringify_key(key) {
  return is_identifier.test(key) ? "." + key : "[" + JSON.stringify(key) + "]";
}
function is_valid_array_index(n) {
  if (!Number.isInteger(n)) return false;
  if (n < 0) return false;
  if (n > MAX_ARRAY_INDEX) return false;
  return true;
}
function is_valid_array_len(n) {
  if (!Number.isInteger(n)) return false;
  if (n < 0) return false;
  if (n > MAX_ARRAY_LEN) return false;
  return true;
}
function is_valid_array_index_string(s) {
  if (s.length === 0) return false;
  if (s.length > 1 && s.charCodeAt(0) === 48) return false;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 48 || c > 57) return false;
  }
  return is_valid_array_index(+s);
}
function array_index_cut(keys) {
  for (var i = keys.length - 1; i >= 0; i--) {
    if (is_valid_array_index_string(keys[i])) {
      break;
    }
  }
  return i + 1;
}
function valid_array_indices(array) {
  const keys = Object.keys(array);
  keys.length = array_index_cut(keys);
  return keys;
}

// ../../../node_modules/devalue/src/base64.js
function encode_native(array_buffer) {
  return new Uint8Array(array_buffer).toBase64();
}
function decode_native(base64) {
  return Uint8Array.fromBase64(base64).buffer;
}
function encode_buffer(array_buffer) {
  return Buffer.from(array_buffer).toString("base64");
}
function decode_buffer(base64) {
  return Uint8Array.from(Buffer.from(base64, "base64")).buffer;
}
function encode_legacy(array_buffer) {
  const array = new Uint8Array(array_buffer);
  let binary = "";
  const chunk_size = 32768;
  for (let i = 0; i < array.length; i += chunk_size) {
    const chunk = array.subarray(i, i + chunk_size);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}
function decode_legacy(base64) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const array = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    array[i] = binary_string.charCodeAt(i);
  }
  return array.buffer;
}
var native = typeof Uint8Array.fromBase64 === "function";
var buffer = typeof process === "object" && process.versions?.node !== void 0;
var encode64 = native ? encode_native : buffer ? encode_buffer : encode_legacy;
var decode64 = native ? decode_native : buffer ? decode_buffer : decode_legacy;

// ../../../node_modules/devalue/src/operations.js
function merge_operations(defaults, overrides) {
  if (!overrides) return defaults;
  const merged = (
    /** @type {T} */
    {}
  );
  for (
    const key of
    /** @type {(keyof T)[]} */
    Object.keys(defaults)
  ) {
    merged[key] = overrides[key] ?? defaults[key];
  }
  return merged;
}
var NOT_PLAIN = /* @__PURE__ */ Object.freeze({ kind: "not-plain" });
var SYMBOL_KEYS = /* @__PURE__ */ Object.freeze({ kind: "symbol-keys" });
var stringify_operations = {
  identify: (value) => value,
  typeOf: (value) => value === null ? "null" : typeof value,
  toPrimitive: (value) => value,
  tagOf: (value) => get_type(value),
  isThenable: (value) => typeof value.then === "function",
  toPromise: (thenable) => Promise.resolve(thenable),
  unbox: (boxed) => boxed.valueOf(),
  toISOString: (date) => isNaN(date.getDate()) ? "" : date.toISOString(),
  toStringValue: (value) => value.toString(),
  regExpInfo: (regexp) => ({ source: regexp.source, flags: regexp.flags }),
  valuesOf: (set) => set,
  entriesOf: (map) => map,
  viewInfo: (view) => {
    if (is_buffer(view)) view = new Uint8Array(view);
    return {
      buffer: view.buffer,
      byteOffset: view.byteOffset,
      byteLength: view.byteLength,
      length: view.length,
      bufferByteLength: view.buffer.byteLength
    };
  },
  toArrayBuffer: (buffer2) => buffer2,
  lengthOf: (array) => array.length,
  hasOwn: (value, key) => Object.hasOwn(value, key),
  indicesOf: (array) => valid_array_indices(array),
  shapeOf: (value) => {
    if (!is_plain_object(value)) return NOT_PLAIN;
    if (enumerable_symbols(value).length > 0) return SYMBOL_KEYS;
    return {
      kind: Object.getPrototypeOf(value) === null ? "null-proto" : "plain",
      keys: Object.keys(value)
    };
  },
  get: (value, key) => value[key]
};
var default_stringify_operations = /* @__PURE__ */ Object.freeze(stringify_operations);
var array_buffer_byte_length = /* @__PURE__ */ (() => Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get)();
var shared_array_buffer_byte_length = /* @__PURE__ */ (() => typeof SharedArrayBuffer === "undefined" ? void 0 : Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength").get)();
var parse_operations = {
  fromPrimitive: (primitive) => primitive,
  fromISOString: (iso) => new Date(iso),
  fromStringValue: (tag, text) => {
    if (tag === "URL") return new URL(text);
    if (tag === "URLSearchParams") return new URLSearchParams(text);
    return Temporal[tag.slice(9)].from(text);
  },
  fromArrayBuffer: (buffer2) => buffer2,
  fromRegExpInfo: (source, flags) => new RegExp(source, flags),
  fromViewInfo: (tag, buffer2, byteOffset, length) => {
    try {
      array_buffer_byte_length.call(buffer2);
    } catch (error) {
      if (!shared_array_buffer_byte_length) throw error;
      shared_array_buffer_byte_length.call(buffer2);
    }
    const Constructor = (
      /** @type {any} */
      globalThis[tag]
    );
    return byteOffset !== void 0 ? new Constructor(buffer2, byteOffset, length) : new Constructor(buffer2);
  },
  box: (value) => Object(value),
  createArray: (length) => new Array(length),
  createSparseArray: (length) => {
    const array = [];
    array[MAX_ARRAY_INDEX] = void 0;
    delete array[MAX_ARRAY_INDEX];
    array.length = length;
    return array;
  },
  createObject: () => ({}),
  createNullPrototypeObject: () => /* @__PURE__ */ Object.create(null),
  createSet: () => /* @__PURE__ */ new Set(),
  createMap: () => /* @__PURE__ */ new Map(),
  set: (target, key, value) => {
    target[key] = value;
  },
  addValue: (set, value) => {
    set.add(value);
  },
  addEntry: (map, key, value) => {
    map.set(key, value);
  }
};
var default_parse_operations = /* @__PURE__ */ Object.freeze(parse_operations);

// ../../../node_modules/devalue/src/parse.js
function parse(serialized, revivers, options) {
  return unflatten(JSON.parse(serialized), revivers, options);
}
function unflatten(parsed, revivers, options) {
  const ops = merge_operations(default_parse_operations, options?.operations);
  if (typeof parsed === "number") return hydrate(parsed, true);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Invalid input");
  }
  const values = (
    /** @type {any[]} */
    parsed
  );
  const hydrated = Array(values.length);
  let hydrating = null;
  function hydrate(index, standalone = false) {
    if (index === UNDEFINED) return ops.fromPrimitive(void 0);
    if (index === NAN) return ops.fromPrimitive(NaN);
    if (index === POSITIVE_INFINITY) return ops.fromPrimitive(Infinity);
    if (index === NEGATIVE_INFINITY) return ops.fromPrimitive(-Infinity);
    if (index === NEGATIVE_ZERO) return ops.fromPrimitive(-0);
    if (standalone || typeof index !== "number") {
      throw new Error(\`Invalid input\`);
    }
    if (index in hydrated) return hydrated[index];
    if (index >= values.length) {
      throw new Error(\`Invalid input\`);
    }
    const value = values[index];
    if (!value || typeof value !== "object") {
      hydrated[index] = ops.fromPrimitive(value);
    } else if (Array.isArray(value)) {
      if (typeof value[0] === "string") {
        const type = value[0];
        const reviver = revivers && Object.hasOwn(revivers, type) ? revivers[type] : void 0;
        if (reviver) {
          let i = value[1];
          if (typeof i !== "number") {
            i = values.push(value[1]) - 1;
          }
          if (Object.hasOwn(hydrated, i)) {
            return hydrated[index] = reviver(hydrated[i]);
          }
          hydrating ??= /* @__PURE__ */ new Set();
          if (hydrating.has(i)) {
            throw new Error("Invalid circular reference");
          }
          hydrating.add(i);
          hydrated[index] = reviver(hydrate(i));
          hydrating.delete(i);
          return hydrated[index];
        }
        switch (type) {
          case "Date":
            hydrated[index] = ops.fromISOString(value[1]);
            break;
          case "Set":
            const set = ops.createSet();
            hydrated[index] = set;
            for (let i = 1; i < value.length; i += 1) {
              ops.addValue(set, hydrate(value[i]));
            }
            break;
          case "Map":
            const map = ops.createMap();
            hydrated[index] = map;
            for (let i = 1; i < value.length; i += 2) {
              ops.addEntry(map, hydrate(value[i]), hydrate(value[i + 1]));
            }
            break;
          case "RegExp":
            hydrated[index] = ops.fromRegExpInfo(value[1], value[2]);
            break;
          case "Object": {
            const wrapped_index = value[1];
            if (typeof values[wrapped_index] === "object" && values[wrapped_index][0] !== "BigInt") {
              throw new Error("Invalid input");
            }
            hydrated[index] = ops.box(hydrate(wrapped_index));
            break;
          }
          case "BigInt":
            hydrated[index] = ops.fromPrimitive(BigInt(value[1]));
            break;
          case "null":
            const obj = ops.createNullPrototypeObject();
            hydrated[index] = obj;
            for (let i = 1; i < value.length; i += 2) {
              const key = value[i];
              if (typeof key !== "string") {
                throw new Error("Cannot parse an object with a non-string key");
              }
              if (key === "__proto__") {
                throw new Error("Cannot parse an object with a \`__proto__\` property");
              }
              ops.set(obj, key, hydrate(value[i + 1]));
            }
            break;
          case "Int8Array":
          case "Uint8Array":
          case "Uint8ClampedArray":
          case "Int16Array":
          case "Uint16Array":
          case "Float16Array":
          case "Int32Array":
          case "Uint32Array":
          case "Float32Array":
          case "Float64Array":
          case "BigInt64Array":
          case "BigUint64Array":
          case "DataView": {
            if (values[value[1]][0] !== "ArrayBuffer") {
              throw new Error("Invalid data");
            }
            const buffer2 = hydrate(value[1]);
            hydrated[index] = ops.fromViewInfo(type, buffer2, value[2], value[3]);
            break;
          }
          case "ArrayBuffer": {
            const base64 = value[1];
            if (typeof base64 !== "string") {
              throw new Error("Invalid ArrayBuffer encoding");
            }
            hydrated[index] = ops.fromArrayBuffer(decode64(base64));
            break;
          }
          case "URL":
          case "URLSearchParams":
          case "Temporal.Duration":
          case "Temporal.Instant":
          case "Temporal.PlainDate":
          case "Temporal.PlainTime":
          case "Temporal.PlainDateTime":
          case "Temporal.PlainMonthDay":
          case "Temporal.PlainYearMonth":
          case "Temporal.ZonedDateTime": {
            hydrated[index] = ops.fromStringValue(type, value[1]);
            break;
          }
          default:
            throw new Error(\`Unknown type \${type}\`);
        }
      } else if (value[0] === SPARSE) {
        const len = value[1];
        if (!is_valid_array_len(len)) {
          throw new Error("Invalid input");
        }
        const array = ops.createSparseArray(len);
        hydrated[index] = array;
        for (let i = 2; i < value.length; i += 2) {
          const idx = value[i];
          if (!is_valid_array_index(idx) || idx >= len) {
            throw new Error("Invalid input");
          }
          ops.set(array, idx, hydrate(value[i + 1]));
        }
      } else {
        const array = ops.createArray(value.length);
        hydrated[index] = array;
        for (let i = 0; i < value.length; i += 1) {
          const n = value[i];
          if (n === HOLE) continue;
          ops.set(array, i, hydrate(n));
        }
      }
    } else {
      const object = ops.createObject();
      hydrated[index] = object;
      for (const key of Object.keys(value)) {
        if (key === "__proto__") {
          throw new Error("Cannot parse an object with a \`__proto__\` property");
        }
        ops.set(object, key, hydrate(value[key]));
      }
    }
    return hydrated[index];
  }
  return hydrate(0);
}

// ../../../node_modules/devalue/src/stringify.js
function stringify(value, reducers, options) {
  const stringified = run(false, value, reducers, options);
  return typeof stringified === "string" ? stringified : \`[\${stringified.join(",")}]\`;
}
function run(async, value, reducers, options) {
  const ops = merge_operations(default_stringify_operations, options?.operations);
  const stringified = [];
  const indexes = /* @__PURE__ */ new Map();
  const custom = [];
  if (reducers) {
    for (const key of Object.getOwnPropertyNames(reducers)) {
      custom.push({ key, fn: reducers[key] });
    }
  }
  const keys = [];
  let p = 0;
  function flatten(thing, index2) {
    const type = ops.typeOf(thing);
    if (type === "undefined") return UNDEFINED;
    let number;
    if (type === "number") {
      number = /** @type {number} */
      ops.toPrimitive(thing);
      if (Number.isNaN(number)) return NAN;
      if (number === Infinity) return POSITIVE_INFINITY;
      if (number === -Infinity) return NEGATIVE_INFINITY;
      if (number === 0 && 1 / number < 0) return NEGATIVE_ZERO;
    }
    const id = ops.identify(thing);
    if (indexes.has(id)) return (
      /** @type {number} */
      indexes.get(id)
    );
    index2 ??= p++;
    indexes.set(id, index2);
    for (const { key, fn } of custom) {
      const value2 = fn(thing);
      if (value2) {
        stringified[index2] = \`["\${key}",\${flatten(value2)}]\`;
        return index2;
      }
    }
    if (type === "function") {
      throw new DevalueError(\`Cannot stringify a function\`, keys, thing, value);
    } else if (type === "symbol") {
      throw new DevalueError(\`Cannot stringify a Symbol primitive\`, keys, thing, value);
    }
    let str = "";
    if (type !== "object") {
      str = stringify_primitive(type === "number" ? number : ops.toPrimitive(thing));
    } else if (ops.isThenable(thing)) {
      if (!async) {
        throw new DevalueError(
          \`Cannot stringify a Promise or thenable \\u2014 use stringifyAsync instead\`,
          keys,
          thing,
          value
        );
      }
      str = ops.toPromise(thing).then((value2) => {
        const i = flatten(value2, index2);
        if (i < 0) stringified[index2] = i;
      });
      str.catch(() => {
      });
    } else {
      const tag = ops.tagOf(thing);
      switch (tag) {
        case "Number":
        case "String":
        case "Boolean":
        case "BigInt":
          str = \`["Object",\${flatten(ops.unbox(thing))}]\`;
          break;
        case "Date":
          str = \`["Date","\${ops.toISOString(thing)}"]\`;
          break;
        case "URL":
          str = \`["URL",\${stringify_string(ops.toStringValue(thing))}]\`;
          break;
        case "URLSearchParams":
          str = \`["URLSearchParams",\${stringify_string(ops.toStringValue(thing))}]\`;
          break;
        case "RegExp":
          const { source, flags } = ops.regExpInfo(thing);
          str = flags ? \`["RegExp",\${stringify_string(source)},"\${flags}"]\` : \`["RegExp",\${stringify_string(source)}]\`;
          break;
        case "Array": {
          let mostly_dense = false;
          const length = ops.lengthOf(thing);
          str = "[";
          for (let i = 0; i < length; i += 1) {
            if (i > 0) str += ",";
            if (ops.hasOwn(thing, i)) {
              keys.push(\`[\${i}]\`);
              str += flatten(ops.get(thing, i));
              keys.pop();
            } else if (mostly_dense) {
              str += HOLE;
            } else {
              const populated_keys = ops.indicesOf(thing);
              const population = populated_keys.length;
              const d = String(length).length;
              const hole_cost = (length - population) * 3;
              const sparse_cost = 4 + d + population * (d + 1);
              if (hole_cost > sparse_cost) {
                str = "[" + SPARSE + "," + length;
                for (let j = 0; j < populated_keys.length; j++) {
                  const key = populated_keys[j];
                  keys.push(\`[\${key}]\`);
                  str += "," + key + "," + flatten(ops.get(thing, key));
                  keys.pop();
                }
                break;
              } else {
                mostly_dense = true;
                str += HOLE;
              }
            }
          }
          str += "]";
          break;
        }
        case "Set":
          str = '["Set"';
          for (const value2 of ops.valuesOf(thing)) {
            str += \`,\${flatten(value2)}\`;
          }
          str += "]";
          break;
        case "Map":
          str = '["Map"';
          for (const [key, value2] of ops.entriesOf(thing)) {
            const key_type = ops.typeOf(key);
            const key_is_primitive = key_type !== "object" && key_type !== "function" && key_type !== "symbol";
            keys.push(
              \`.get(\${key_is_primitive ? stringify_primitive(ops.toPrimitive(key)) : "..."})\`
            );
            str += \`,\${flatten(key)},\${flatten(value2)}\`;
            keys.pop();
          }
          str += "]";
          break;
        case "Int8Array":
        case "Uint8Array":
        case "Uint8ClampedArray":
        case "Int16Array":
        case "Uint16Array":
        case "Float16Array":
        case "Int32Array":
        case "Uint32Array":
        case "Float32Array":
        case "Float64Array":
        case "BigInt64Array":
        case "BigUint64Array": {
          const info = ops.viewInfo(thing);
          str = '["' + tag + '",' + flatten(info.buffer);
          if (info.byteLength !== info.bufferByteLength) {
            str += \`,\${info.byteOffset},\${info.length}\`;
          }
          str += "]";
          break;
        }
        case "DataView": {
          const info = ops.viewInfo(thing);
          str = '["' + tag + '",' + flatten(info.buffer);
          if (info.byteLength !== info.bufferByteLength) {
            str += \`,\${info.byteOffset},\${info.byteLength}\`;
          }
          str += "]";
          break;
        }
        case "ArrayBuffer": {
          const base64 = encode64(ops.toArrayBuffer(thing));
          str = \`["ArrayBuffer","\${base64}"]\`;
          break;
        }
        case "Temporal.Duration":
        case "Temporal.Instant":
        case "Temporal.PlainDate":
        case "Temporal.PlainTime":
        case "Temporal.PlainDateTime":
        case "Temporal.PlainMonthDay":
        case "Temporal.PlainYearMonth":
        case "Temporal.ZonedDateTime":
          str = \`["\${tag}",\${stringify_string(ops.toStringValue(thing))}]\`;
          break;
        default: {
          const shape = ops.shapeOf(thing);
          if (shape.kind === "not-plain") {
            throw new DevalueError(\`Cannot stringify arbitrary non-POJOs\`, keys, thing, value);
          }
          if (shape.kind === "symbol-keys") {
            throw new DevalueError(\`Cannot stringify POJOs with symbolic keys\`, keys, thing, value);
          }
          if (shape.kind === "null-proto") {
            str = '["null"';
            for (const key of shape.keys) {
              if (key === "__proto__") {
                throw new DevalueError(
                  \`Cannot stringify objects with __proto__ keys\`,
                  keys,
                  thing,
                  value
                );
              }
              keys.push(stringify_key(key));
              str += \`,\${stringify_string(key)},\${flatten(ops.get(thing, key))}\`;
              keys.pop();
            }
            str += "]";
          } else {
            str = "{";
            let started = false;
            for (const key of shape.keys) {
              if (key === "__proto__") {
                throw new DevalueError(
                  \`Cannot stringify objects with __proto__ keys\`,
                  keys,
                  thing,
                  value
                );
              }
              if (started) str += ",";
              started = true;
              keys.push(stringify_key(key));
              str += \`\${stringify_string(key)}:\${flatten(ops.get(thing, key))}\`;
              keys.pop();
            }
            str += "}";
          }
        }
      }
    }
    stringified[index2] = str;
    return index2;
  }
  const index = flatten(value);
  if (index < 0) return \`\${index}\`;
  return stringified;
}
function stringify_primitive(thing) {
  const type = typeof thing;
  if (type === "string") return stringify_string(thing);
  if (thing === void 0) return UNDEFINED.toString();
  if (thing === 0 && 1 / thing < 0) return NEGATIVE_ZERO.toString();
  if (type === "bigint") return \`["BigInt","\${thing}"]\`;
  return String(thing);
}

// src/utils/typeChecks.ts
function isString(value) {
  return typeof value === "string";
}
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isArray(value) {
  return Array.isArray(value);
}

// src/modules/serverFunctions/bundled/protocol.ts
var contentType = "text/plain;charset=UTF-8";
var maxArgumentCount = 1024;
function isServerFunctionRequest(value) {
  return isObject(value) && isString(value.name) && isArray(value.args) && value.args.length <= maxArgumentCount;
}
function parseServerFunctionRequest(text) {
  try {
    const value = parse(text);
    if (isServerFunctionRequest(value)) {
      return value;
    }
  } catch {
  }
  return void 0;
}

// src/modules/serverFunctions/bundled/serverRuntime.ts?bundle
var corsHeaders = { "access-control-allow-origin": "*" };
function createHandler(serverExports) {
  return {
    async fetch(request) {
      if (request.method !== "POST") {
        return createResponse(
          405,
          {
            type: "error",
            error: {
              name: "MethodNotAllowed",
              message: \`Server functions are called with POST, not \${request.method}\`
            }
          },
          {
            allow: "POST"
          }
        );
      }
      return handlePost(request, serverExports);
    }
  };
}
async function handlePost(request, serverExports) {
  let text;
  try {
    text = await request.text();
  } catch {
    return createResponse(400, {
      type: "error",
      error: {
        name: "BadRequest",
        message: "The body could not be read"
      }
    });
  }
  const serverFunctionRequest = parseServerFunctionRequest(text);
  if (!serverFunctionRequest) {
    return createResponse(400, {
      type: "error",
      error: {
        name: "BadRequest",
        message: "The body must be a devalue-encoded { name, args } object"
      }
    });
  }
  const { name, args } = serverFunctionRequest;
  const serverFunction = Object.hasOwn(serverExports, name) ? serverExports[name] : void 0;
  if (typeof serverFunction !== "function") {
    return createResponse(404, {
      type: "error",
      error: {
        name: "NotFound",
        message: \`There is no server function named \\u201C\${name}\\u201D\`
      }
    });
  }
  try {
    const result = await serverFunction(...args);
    return createResponse(200, {
      type: "result",
      result
    });
  } catch (error) {
    if (error instanceof Error) {
      return createResponse(500, {
        type: "error",
        error: {
          name: error.name,
          message: error.message
        }
      });
    }
    return createResponse(500, {
      type: "error",
      error: {
        name: "InternalError",
        message: \`Server function \\u201C\${name}\\u201D failed\`
      }
    });
  }
}
function createResponse(status, body, headers) {
  return new Response(stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      ...headers,
      "content-type": contentType
    }
  });
}
export {
  createHandler
};
`;export{n as clientRuntimeSource,e as serverRuntimeSource};
//# sourceMappingURL=https://martamon.github.io/portfolio/app.framerstatic.com/serverFunctionRuntimes-CATETTOP.mjs.map
