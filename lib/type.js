const isFunction = require('./utils/isFunction');
const isString = require('./utils/isString');

class Type {
    constructor(type) {
        if (!isString(type.id) ||
            !isString(type.name) ||
            !isString(type.description) ||
            !isFunction(type.validate) ||
            !isFunction(type.config)) {
            //Simple type implementation check for now
            throw new Error('Invalid type implementation');
        }
        Object.defineProperties(this, {
            'id': {
                value: type.id
            },
            'name': {
                value: type.name
            },
            'description': {
                value: type.description
            },
            'validate': {
                value: (value, config) => type.validate(value, config)

            },
            'config': {
                value: config => type.config(config)
            }
        });
        Object.freeze(this);
    }
}

module.exports = Type;