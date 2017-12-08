const isFunction = method => typeof(method) === "function";
const isString = obj => Object.prototype.toString.call(obj) === '[object String]';

class Type {
    constructor(type) {
        if (!isString(type.name) || !isFunction(type.validate) || !isFunction(type.filter) || !isFunction(type.config)) {
            //Simple type implementation check for now
            throw new Error('Invalid type implementation');
        }
        Object.defineProperties(this, {
            'name': {
                value: type.name
            },
            'validate': {
                value: config => type.validate(config)

            },
            'filter': {
                value: config => type.filter(config)
            },
            'config': {
                value: config => type.config(config)
            }
        });
        Object.freeze(this);
    }
}

module.exports = Type;