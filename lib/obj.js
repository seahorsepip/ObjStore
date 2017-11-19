let priv;

class Obj {
    constructor(store, model, data) {
        Object.defineProperty(this, '_store', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: store
        });
        Object.defineProperty(this, '_model', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: model
        });
        defineId(this);
        this.data(data);
        Object.preventExtensions(this);
    }

    async commit(callback) {
        callback = callback || (() => undefined);
        try {
            if (this.id === undefined) {
                this.id = await priv.get(this._store).provider.create(this._model.name, this);
            } else {
                this.data(await this._store.update(this.id, this).data());
            }
            callback(null, this);
            return this;
        } catch (error) {
            callback(error);
            throw error;
        }
    }

    async read(callback) {
        callback = callback || (() => undefined);
        if (this.id === undefined) throw 'Error: Object needs to be committed before it can be read';
        try {
            this.data(await this._store.read(this.id).data());
            callback(null, this);
            return this;
        } catch (error) {
            callback(error);
            throw error;
        }
    }

    async drop(callback) {
        callback = callback || (() => undefined);
        if (this.id === undefined) throw 'Error: Object needs to be committed before it can be deleted';
        try {
            await this._store.drop(this.id);
            defineId(this);
            callback(null, this);
            return this;
        } catch (error) {
            callback(error);
            throw error;
        }
    }

    data(data) {
        if (data === undefined) {
            data = {};
            Object.keys(this).forEach((key) => data[key] = this[key]);
            return data;
        }
        Object.keys(data).forEach((key) => this[key] = data[key]);
        return this;
    }
}

function defineId(obj) {
    Object.defineProperty(obj, 'id', {
        configurable: true,
        enumerable: false,
        set: value => {
            Object.defineProperty(obj, 'id', {
                configurable: true,
                enumerable: true,
                writable: false,
                value: value
            });
        }
    });
}

module.exports = (store, model, data, globalPriv) => {
    priv = globalPriv;
    return new Obj(store, model, data);
};