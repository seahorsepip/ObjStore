const Obj = require('./obj');
const Model = require('./model');
const Type = require('./type');
const noop = require('./utils/noop');
const bindFunctions = require('./utils/bindFunctions');
const priv = new WeakMap();
Obj.priv(priv);
Model.priv(priv);

class Store {
    constructor(objStore, provider) {
        priv.set(this, {objStore, provider, models: {}, types: {}});
        Object.defineProperties(this, {
            'models': {
                value: bindFunctions(this.models, this)
            },
            'types': {
                value: bindFunctions(this.types, this)
            }
        });
        Object.freeze(this);
    }

    use(provider) {
        return priv.get(this).objStore.use(provider);
    }

    async create(modelId, data, commit, callback = noop) {
        try {
            let model = await this.models.read(modelId);
            console.log(model);
            let object = new Obj(this, model, data);
            if (commit) await object.commit();
            callback(null, object);
            return object;
        } catch (error) {
            callback(error);
            throw error;
        }
    }

    async read(id, callback = noop) {
        try {
            let results = await priv.get(this).provider.read(id);
            if (!Array.isArray(results)) results = [results];
            let model = await this.models.read(results[0].modelId);
            let objects = [];
            results.forEach(result => objects.push(new Obj(this, model, result.data, result.id)));
            if (objects.length === 1) objects = objects[0];
            callback(null, objects);
            return objects;
        } catch (error) {
            callback(error);
            throw error;
        }
    }

    async update(id, obj, callback = noop) {
        try {
            if (obj.id === undefined) return (await this.read(id)).commit();
            await priv.get(this).provider.update(id, priv.get(obj).data);
            callback(null, obj);
            return obj;
        } catch (error) {
            callback(error);
            throw error;
        }
    }

    async drop(id, callback = noop) {
        try {
            await priv.get(this).provider.drop(id);
            callback(null);
        } catch (error) {
            callback(error);
            throw error;
        }
    }
}

Store.prototype.models = {
    create: async function (name, fields, commit, callback = noop) {
        try {
            let model = new Model(this, name, fields);
            if (commit) model = await model.commit();
            callback(null, model);
            return model;
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
                console.log(results);
                if (!Array.isArray(results)) results = [results];
                results.forEach(result => models.push(new Model(this, result.name, result.data, result.id)));
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
        //TODO implement update
    },
    drop: async function () {
        //TODO implement drop
    }
};

Store.prototype.types = {
    register: function (types, callback = noop) {
        try {
            if (!Array.isArray(types)) types = [types];
            types = types.map(type => new Type(type));
            types.forEach(type => priv.get(this).types[type.id] = type);
            if (types.length === 1) types = types[0];
            callback(null, types);
            return types;
        } catch (error) {
            callback(error);
            throw error;
        }
    }
};


module.exports = Store;
