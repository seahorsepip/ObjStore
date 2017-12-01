const field = require('./field');
const isString = (obj) => Object.prototype.toString.call(obj) === '[object String]';
const noop = () => {
};
let priv;

class Model {
    constructor(store, name, data) {
        if(!isString(name)) throw new Error('Name is not a valid string');
        priv.set(this, {
            id: undefined,
            name: name,
            store: store,
            fields: data
        });
        Object.defineProperty(this, 'id', {
            configurable: false,
            enumerable: true,
            get: () => priv.get(this).id,
            set: () => {
                throw new Error('Id can\'t be set manually, it\'s generated after a commit');
            }
        });
        Object.defineProperty(this, 'name', {
            configurable: false,
            enumerable: true,
            get: () => priv.get(this).name,
            set: (value) => priv.get(this).name = value
        });
        Object.defineProperty(this, 'fields', {
            configurable: false,
            enumerable: true,
            get: () => priv.get(this).fields,
            set: (value) => {
                priv.get(this).fields = value
            }
        });
    }

    async commit(callback = noop) {
        try {
            if (this.id === undefined) {
                priv.get(this).id = await priv.get(priv.get(this).store).provider.models.create(name, this.fields);
                console.log(priv.get(this).id);
            } else {
                //this.data(await priv.get(this).store.update(this.id, this).data());
            }
            callback(null, this);
            return this;
        } catch (error) {
            callback(error);
            throw error;
        }
    }
}

module.exports = Model;
module.exports.priv = value => priv = value;