const Field = require('./field');
const isString = obj => Object.prototype.toString.call(obj) === '[object String]';
const noop = () => {
};
let priv;

class Model {
    constructor(store, name) {
        if (!isString(name)) throw new Error('Name is not a valid string');
        priv.set(this, {
            id: undefined,
            name: name,
            store: store,
            fields: data
        });
        Object.defineProperties(this, {
            'id': {
                configurable: false,
                enumerable: true,
                get: () => priv.get(this).id,
                set: () => {
                    throw new Error('Id can\'t be set manually, it\'s generated after a commit');
                }
            },
            'name': {
                configurable: false,
                enumerable: true,
                get: () => priv.get(this).name,
                set: (value) => {
                    if (!isString(value)) throw new Error('Name is not a valid string');
                    if (value.length > 64) throw new Error('Name can\'t be longer then 64 characters');
                    priv.get(this).name = value
                }
            },
            'fields': {
                configurable: false,
                enumerable: true,
                get: () => priv.get(this).fields,
                set: (value) => {
                    console.log("yay");
                    priv.get(this).fields = value
                }
            }
        });
        Object.seal(this);
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

Model.prototype.fields = {
    create: async function (name, data, callback = noop) {
        try {
            priv.get(this).fields[name] = new Field(data);
            callback(null, this);
            return this;
        } catch (error) {
            callback(error);
            throw error;
        }
    },
    read: async function (id, callback = noop) {
        try {
            let models = [];
            if (id in priv.get(this).models) {
                models.push(priv.get(this).models[id]);
            } else {
                let results = await priv.get(this).provider.models.read(id);
                if (!Array.isArray(results)) results = [results];
                results.forEach(result => {
                    let model = new Model(this, result.name, result.data);
                    priv.get(model).id = result.id;
                    models.push(model);
                });
            }
            if (models.length === 1) models = models[0];
            callback(null, models);
            return models;
        } catch (error) {
            callback(error);
            throw error;
        }
    },
    update: async function () {
        console.log(this);
    },
    drop: async function () {
        console.log(this);
    }
};

module.exports = Model;
module.exports.priv = value => priv = value;