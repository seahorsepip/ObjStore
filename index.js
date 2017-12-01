const Store = require("./lib/store");
const stores = new WeakMap();

module.exports.use = function use(provider) {
    if (stores.has(provider)) return stores.get(provider);
    stores.set(provider, new Store(this, provider));
    return use(provider);
};
module.exports.providers = {
    localStorage: require('./lib/providers/localstorage')
};
module.exports.fields = {
    text: require('./lib/fields/text')
};