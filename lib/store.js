const obj = require('./obj');
const model = require('./model');
require('nodeify').extend(Promise);

function Store(objStore, provider) {
    this._objStore = objStore;
    this._provider = provider;
    this._models = {};
    this._storage = {
        objects: {},
        models: {}
    };
    Object.keys(this.models).forEach(key => this.models[key] = this.models[key].bind(this));
}

Store.prototype = {
    use: function (provider) {
        return this._objStore.use(provider);
    },
    create: function (modelName, data, callback) {
        return Promise.resolve(this._models[modelName])
            .then(model => model ? model : this.models.read(modelName))
            .then(model => obj(this, model, data))
            .nodeify(callback);
    },
    read: function (id, callback) {
        let createObj = (result, model) => {
            let object = obj(this, model, result.data);
            object.id = result.id;
            return object;
        };
        return this._provider.read(id)
            .then(results => Promise.all([results, this.models.read((Array.isArray(results) ? results[0] : results).model)]))
            .then(([results, model]) => {
                if (!Array.isArray(results)) return createObj(results, model);
                let objects = [];
                results.forEach(result => {
                    objects.push(createObj(result, model))
                });
                return objects;
            })
            .nodeify(callback);
    },
    update: async function (id, data, callback) {
        callback = callback || (() => undefined);
        try {
            let obj = (data.id === undefined ? await this.read(id) : data).data(data);
            await this._provider.update(obj.id, obj);
            callback(null, obj);
            return obj;
        } catch (error) {
            callback(error);
            throw error;
        }
    },
    delete: function (id, callback) {
        return Promise.resolve()
            .then(() => this._provider.delete(id))
            .nodeify(callback);
    },
    models: {
        create: function (name, data) {
            let that = this;
            return new Promise((resolve, reject) => {
                try {
                    that._storage.models[name] = model(name, data);
                    resolve(that._storage.models[name]);
                } catch (error) {
                    reject(error);
                }
            });
        },
        read: function (name) {
            let that = this;
            return new Promise((resolve, reject) => {
                if (name === undefined) {
                    that._models = that._storage.models;
                    resolve(that._storage.models);
                } else if (that._storage.models[name]) {
                    that._models[name] = that._storage.models[name];
                    resolve(that._storage.models[name]);
                } else {
                    reject('Error: model not found');
                }
            });
        }
    }
};

module.exports = (objStore, provider) => new Store(objStore, provider);