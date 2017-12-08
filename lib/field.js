const isFunction = method => typeof(method) === "function";
const isString = obj => Object.prototype.toString.call(obj) === '[object String]';
const priv = new WeakMap();

class Field {
    constructor(key, name, type, config) {
        priv.set(this, {config});
        Object.defineProperties(this, {
            'key': {
                enumerable: true,
                get: () => key
            },
            'name': {
                enumerable: true,
                get: () => name
            },
            'type': {
                enumerable: true,
                get: () => type.name
            },
            'config': {
                enumerable: true,
                get: () => priv.get(this).config,
                set: value => (async (value) => priv.get(this).config = await type.config(value))(value)
            }
        });
        Object.freeze(this);
    }
}

module.exports = Field;