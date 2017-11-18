function Field(field) {
    if (!isString(field.name) || !isFunction(field.get) || !isFunction(field.set)) {
        throw "Invalid field implementation";
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

function isString(obj) {
    return (Object.prototype.toString.call(obj) === '[object String]');
}

function isFunction(method) {
    return typeof(method) === "function";
}

module.exports = (field) => new Field(field);