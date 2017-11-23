const stores = [];
const priv = new WeakMap();

module.exports.use = (provider) => {
    stores.forEach(store => {
        if (priv.get(store).provider === provider) return store;
    });
    let store = require('./lib/store')(this, provider, priv);
    stores.push(store);
    return store;
};
module.exports.providers = {
    localStorage: require('./lib/providers/localstorage')
};
module.exports.fields = {
    text: require('./lib/fields/text')
};