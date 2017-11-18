function Obj(store, model, data) {
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

Obj.prototype.commit = async function (callback) {
    callback = callback || (() => undefined);
    try {
        if(this.id === undefined) {
            this.id = await this._store._provider.create(this._model.name, this);
        } else {
            this.data(await this._store.update(this.id, this).data());
        }
        callback(null, this);
        return this;
    } catch (error) {
        callback(error);
        throw error;
    }
};

Obj.prototype.read = async function (callback) {
    if (this.id === undefined) throw 'Error: Object needs to be committed before it can be read';
    try {
        this.data(await this._store.read(this.id).data());
        callback(null, this);
        return this;
    } catch (error) {
        callback(error);
        throw error;
    }
};

Obj.prototype.delete = async function (callback) {
    if (this.id === undefined) throw 'Error: Object needs to be committed before it can be deleted';
    try {
        await this._store.delete(this.id);
        defineId(this);
        callback(null, this);
        return this;
    } catch (error) {
        callback(error);
        throw error;
    }
};

Obj.prototype.data = function (data) {
    if (data === undefined) {
        data = {};
        Object.keys(this).forEach((key) => data[key] = this[key]);
        return data;
    }
    Object.keys(data).forEach((key) => this[key] = data[key]);
    return this;
};

module.exports = (store, model, data) => new Obj(store, model, data);