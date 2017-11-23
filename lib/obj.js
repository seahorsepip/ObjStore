const noop = () => {
};
let priv;

class Obj {
    constructor(store, model, data) {
        priv.set(this, {
            id: undefined,
            store: store,
            model: model
        });
        Object.defineProperty(this, 'id', {
            configurable: false,
            enumerable: true,
            get: () => priv.get(this).id,
            set: () => {
                throw new Error('Id cannot be set manually, it\'s generated after a commit')
            }
        });
        this.data(data);
        Object.seal(this);
    }

    async commit(callback = noop) {
        try {
            if (this.id === undefined) {
                priv.get(this).id = await priv.get(priv.get(this).store).provider.create(priv.get(this).model.name, this);
            } else {
                this.data(await priv.get(this).store.update(this.id, this).data());
            }
            callback(null, this);
            return this;
        } catch (error) {
            callback(error);
            throw error;
        }
    }

    async read(callback = noop) {
        if (this.id === undefined) throw new Error('Object needs to be committed before it can be read');
        try {
            this.data(await priv.get(this).store.read(this.id).data());
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

module.exports = (store, model, data, globalPriv) => {
    priv = globalPriv;
    return new Obj(store, model, data);
};