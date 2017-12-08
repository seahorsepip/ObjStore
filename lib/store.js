const Obj = require('./obj');
const Model = require('./model');
const Type = require('./type');
const noop = () => {
};
const priv = new WeakMap();
Obj.priv(priv);
Model.priv(priv);

class Store {
    constructor(objStore, provider) {
        priv.set(this, {
            objStore: objStore,
            provider: provider,
            models: {},
            types: new WeakSet()
        });
        Object.keys(this.models).forEach(key => this.models[key] = this.models[key].bind(this));
        Object.keys(this.types).forEach(key => this.types[key] = this.types[key].bind(this));
        Object.freeze(this);
    }

    use(provider) {
        return priv.get(this).objStore.use(provider);
    }

    async create(modelId, data, commit, callback = noop) {
        try {
            let model = await this.models.read(modelId);
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
            results.forEach(result => {
                let object = new Obj(this, model, result.data);
                priv.get(object).id = result.id;
                objects.push(object);
            });
            if (objects.length === 1) objects = objects[0];
            callback(null, objects);
            return objects;
        } catch (error) {
            callback(error);
            throw error;
        }
    }

    async update(id, data, callback = noop) {
        try {
            let object = (data.id === undefined ? await this.read(id) : data).data(data);
            await priv.get(this).provider.update(object.id, object);
            callback(null, object);
            return object;
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
    create: async function (name, commit, callback = noop) {
        try {
            let model = new Model(this, name);
            if (commit) await model.commit();
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
            types.forEach(type => priv.get(this).types.add(type));
            if (types.length === 1) types = types[0];
            return types;
        } catch (error) {
            throw error;
        }
    }
};


module.exports = Store;
