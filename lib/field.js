const isFunction = method => typeof(method) === "function";
const isString = obj => Object.prototype.toString.call(obj) === '[object String]';

class Field {
    constructor(field) {
        if (!isString(field.name) || !isFunction(field.get) || !isFunction(field.set)) {
            throw new Error('Invalid field implementation');
        }
        Object.defineProperties(this, {
            'get': {
                value: (config) => field.get(config)

            },
            'set': {
                value: (config) => field.set(config)
            }
        });
        Object.freeze(this);
    }
}

module.exports = Field;