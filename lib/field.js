const isFunction = (method) => typeof(method) === "function";
const isString = (obj) => Object.prototype.toString.call(obj) === '[object String]';

class Field {
    constructor(field) {
        if (!isString(field.name) || !isFunction(field.get) || !isFunction(field.set)) {
            throw new Error('Invalid field implementation');
        }
        Object.defineProperty(this, 'get', {
            writable: false,
            value: field.get
        });
        Object.defineProperty(this, 'set', {
            writable: false,
            value: field.set
        });
        this.config = {};
        Object.seal(this);
    }
}

module.exports = Field;