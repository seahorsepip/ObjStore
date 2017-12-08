const Field = require('./field');
const isString = obj => Object.prototype.toString.call(obj) === '[object String]';
const noop = () => {
};
let priv;

class Model {
    constructor(store, name, fields = []) {
        if (!isString(name)) throw new Error('Name is not a valid string');
        priv.set(this, {
            id: undefined,
            store: store,
            name: name,
            fields: {}
        });
        Object.defineProperties(this, {
            'id': {
                enumerable: true,
                get: () => priv.get(this).id,
                set: () => {
                    throw new Error('Id can\'t be set manually, it\'s generated after a commit');
                }
            },
            'name': {
                enumerable: true,
                get: () => priv.get(this).name,
                set: (value) => {
                    if (!isString(value)) throw new Error('Name is not a valid string');
                    if (value.length > 64) throw new Error('Name can\'t be longer then 64 characters');
                    priv.get(this).name = value
                }
            }
        });
        Object.keys(this.fields).forEach(key => this.fields[key] = this.fields[key].bind(this));
        Object.seal(this);
        fields.forEach(field => this.fields.add(field.name, priv.get(store).types[field.type], field.config));//TODO fix this, should use WeakSet instead
    }

    async commit(callback = noop) {
        try {
            if (this.id === undefined) {
                priv.get(this).id = await priv.get(priv.get(this).store).provider.models.create(name, this.types);
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
    create: async function (name, type, config, callback = noop) {
        try {
            if (priv.get(priv.get(this).store).types.has(type)) {
                priv.get(this).fields[name] = new Field(name, type, config);
                callback(null, this);
                return this;
            }
            throw new Error('Type is not registered');
        } catch (error) {
            callback(error);
            throw error;
        }
    },
    read: async function (name, callback = noop) {
        try {
            if (name in priv.get(this).fields) {
                let field = priv.get(this).fields[name];
                callback(null, field);
                return field;
            }
            throw new Error('Field does not exist');
        } catch (error) {
            callback(error);
            throw error;
        }

    },
    update: async function (name, config, callback = noop) {
        try {
            (await this.fields.read(name)).config = config;
            callback(null, this);
            return this;
        } catch (error) {
            callback(error);
            throw error;
        }
    },
    drop: async function (name, callback = noop) {
        try {
            delete (await this.fields.read(name));
            callback(null, this);
            return this;
            /*
            if (name in priv.get(this).fields) {
                delete priv.get(this).fields[name];
                callback(null, this);
                return this;
            }
            throw new Error('Field does not exist');
            */
        } catch (error) {
            callback(error);
            throw error;
        }
    }
};

module.exports = Model;
module.exports.priv = value => priv = value;