const Field = require('./field');
const noop = require('./utils/noop');
const isString = require('./utils/isString');
const bindFunctions = require('./utils/bindFunctions');
let priv;

class Model {
    constructor(store, name, fields = {}, id) {
        priv.set(this, {store, id, name, fields});
        if (id !== undefined) Object.defineProperty(this, 'id', {
            enumerable: true,
            get: () => priv.get(this).id,
            set: () => {
                throw new Error('Id can\'t be set manually, it\'s generated after a commit');
            }
        });
        Object.defineProperties(this, {
            'name': {
                enumerable: true,
                get: () => priv.get(this).name,
                set: (value) => {
                    if (!isString(value)) throw new Error('Name is not a valid string');
                    if (value.length > 64) throw new Error('Name can\'t be longer then 64 characters');
                    priv.get(this).name = value
                }
            },
            'fields': {
                value: bindFunctions(this.fields, this)
            }
        });
        Object.keys(fields).forEach(field => {
            let type = fields[field].type;
            if (!(type in priv.get(priv.get(this).store).types)) throw new Error(`Type with id '${type}' is not registered`);
            priv.get(this).fields[field] = new Field(field, fields[field].name,
                priv.get(priv.get(this).store).types[type], fields[field].config);
        });
        Object.freeze(this);
        this.name = name;
    }

    async commit(callback = noop) {
        try {
            let model;
            if (priv.get(this).id === undefined) {
                let id = await priv.get(priv.get(this).store).provider.models.create(this.name, priv.get(this).fields);
                model = new Model(priv.get(this).store, this.name, priv.get(this).fields, id);
            } else {
                //this.data(await priv.get(this).store.update(this.id, this).data());
            }
            callback(null, model);
            return model;
        } catch (error) {
            callback(error);
            throw error;
        }
    }
}

Model.prototype.fields = {
    create: async function (key, name, type, config, callback = noop) {
        try {
            if (!isString(key)) throw new Error('Key is not a valid string');
            if (!isString(name)) throw new Error('Name is not a valid string');
            if (key.length > 32) throw new Error('Key can\'t be longer then 32 characters');
            if (name.length > 128) throw new Error('Name can\'t be longer then 128 characters');
            if (!(type in priv.get(priv.get(this).store).types)) throw new Error(`Type with id '${type}' is not registered`);
            if (key in priv.get(this).fields) throw new Error(`Field with key '${key}' already exists`);

            let fields = Object.assign({[key]: {key, name, type, config}}, priv.get(this).fields);
            let model = new Model(priv.get(this).store, this.name, fields, priv.get(this).id);
            callback(null, model);
            return model;
        }
        catch (error) {
            callback(error);
            throw error;
        }
    },
    read: async function (key, callback = noop) {
        try {
            if (key in priv.get(this).fields) {
                let field = priv.get(this).fields[key];
                callback(null, field);
                return field;
            }
            throw new Error('Field does not exist');
        } catch (error) {
            callback(error);
            throw error;
        }

    },
    update: async function (key, config, callback = noop) {
        try {
            (await this.fields.read(key)).config = config;
            callback(null, this);
            return this;
        } catch (error) {
            callback(error);
            throw error;
        }
    },
    drop: async function (key, callback = noop) {
        try {
            await this.fields.read(key);
            delete priv.get(this).fields[key];
            callback(null, this);
            return this;
        } catch (error) {
            callback(error);
            throw error;
        }
    }
};

module.exports = Model;
module.exports.priv = value => priv = value;