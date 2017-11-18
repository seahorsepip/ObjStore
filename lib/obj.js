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
    return obj;
}

Obj.prototype.commit = function () {
    return this.id === undefined ?
        this._store._provider.create(this._model.name, this)
            .then(id => {
                this.id = id;
                return this;
            }) :
        this._store.update(this.id, this)
            .then(obj => this.data(obj.data()));
};

Obj.prototype.read = function () {
    if (this.id === undefined) throw 'Error: Object needs to be committed before it can be read';
    return this._store.read(this.id)
        .then(obj => this.data(obj.data()))
};

Obj.prototype.delete = function () {
    if (this.id === undefined) throw 'Error: Object needs to be committed before it can be deleted';
    return this._store.delete(this.id)
        .then(() => defineId(this));
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