const field = require('./field');

function Model(name, model) {
    Object.keys(model).forEach(key => this[key] = field(model[key]));
    Object.defineProperty(this, 'name', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: name
    });
}

Model.prototype.validate = function (data) {
    return data;
};

module.exports = (name, data) => new Model(name, data);