const Field = require('./type');
const noop = require('./utils/noop');
let priv;

class Obj {
    constructor(store, model, data, id) {
        priv.set(this, {id, store, model, data: {}});
        if (id !== undefined) Object.defineProperty(this, 'id', {
            enumerable: true,
            get: () => priv.get(this).id,
            set: () => {
                throw new Error('Id can\'t be set manually, it\'s generated after a commit');
            }
        });
        Object.defineProperties(this, {
            'fields': {
                enumerable: true,
                writable: true,
                value: {}
            },
            'model': {
                enumerable: true,
                get: () => priv.get(this).model
            }
        });
        Object.keys(priv.get(model).fields).forEach(key => Object.defineProperty(this.fields, key, {
            enumerable: true,
            value: (value, callback = noop) => {
                if (value === undefined) return priv.get(this).data[key];
                return (async () => {
                    let field = priv.get(model).fields[key];
                    let type = priv.get(priv.get(this).store).types[field.type];
                    try {
                        priv.get(this).data[key] = await type.validate(value);
                        callback(null, this);
                        return this;
                    } catch (error) {
                        callback(error);
                        throw error;
                    }
                })()
            }
        }));
        Object.freeze(this);
        if (data !== undefined) Object.keys(data).forEach(key => this.fields[key](data[key]));
    }

    async commit(callback = noop) {
        try {
            let store = priv.get(this).store;
            let model = priv.get(this).model;
            let data = priv.get(this).data;
            let id = this.id;
            if (id === undefined) {
                id = await priv.get(store).provider.create(model.id, data);
            } else {
                await store.update(id, this);
            }
            let obj = new Obj(store, model, data, id);
            callback(null, obj);
            return obj;
        } catch (error) {
            callback(error);
            throw error;
        }
    }

    async read(callback = noop) {
        if (this.id === undefined) throw new Error('Object needs to be committed before it can be read');
        try {
            this.data((await priv.get(this).store.read(this.id)).data());
            callback(null, this);
            return this;
        } catch (error) {
            callback(error);
            throw error;
        }
    }

    async drop(callback = noop) {
        if (this.id === undefined) throw new Error('Object needs to be committed before it can be deleted');
        try {
            await priv.get(this).store.drop(this.id);
            priv.get(this).id = undefined;
            callback(null, this);
            return this;
        } catch (error) {
            callback(error);
            throw error;
        }
    }

    toJSON() {
        const json = Object.assign({}, this);
        json.fields = {};
        Object.keys(this.fields).forEach(key => json.fields[key] = this.fields[key]());
        return json;
    }
}

module.exports = Obj;
module.exports.priv = value => priv = value;
