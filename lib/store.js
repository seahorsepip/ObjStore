const obj = require('./obj');
const model = require('./model');
const noop = () => {
};
let priv;

class Store {
    constructor(objStore, provider) {
        priv.set(this, {
            objStore: objStore,
            provider: provider,
            models: {},
            storage: {
                objects: {},
                models: {}
            }
        });
        this.models = {
            create: function (name, data) {
                let that = this;

                return new Promise((resolve, reject) => {
                    try {
                        priv.get(that).storage.models[name] = model(name, data);
                        resolve(priv.get(that).storage.models[name]);
                    } catch (error) {
                        reject(error);
                    }
                });
            },
            read: function (name) {
                let that = this;
                return new Promise((resolve, reject) => {
                    if (name === undefined) {
                        priv.get(that).models = priv.get(that).storage.models;
                        resolve(priv.get(that).storage.models);
                    } else if (priv.get(that).storage.models[name]) {
                        priv.get(that).models[name] = priv.get(that).storage.models[name];
                        resolve(priv.get(that).storage.models[name]);
                    } else {
                        reject('Error: model not found');
                    }
                });
            }
        };
        Object.keys(this.models).forEach(key => this.models[key] = this.models[key].bind(this));
        Object.freeze(this);
    }

    use(provider) {
        return priv.get(this).objStore.use(provider);
    }

    async create(modelName, data, commit, callback = noop) {
        try {
            let model = priv.get(this).models[modelName] ? priv.get(this).models[modelName] : await this.models.read(modelName);
            let object = obj(this, model, data, priv);
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
            let model = await this.models.read(results[0].model);
            let objects = [];
            results.forEach(result => {
                let object = obj(this, model, result.data);
                object.id = result.id;
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


module.exports = (objStore, provider, globalPriv) => {
    priv = globalPriv;
    return new Store(objStore, provider);
};