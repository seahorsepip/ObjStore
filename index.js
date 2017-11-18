const stores = [];

module.exports.use = (provider) => {
    stores.forEach(store => {
        if (store._provider === provider) return store;
    });
    let store = require('./lib/store')(this, provider);
    stores.push(store);
    return store;
};
module.exports.providers = {
    localStorage: require('./lib/providers/localstorage')
};
module.exports.fields = {
    text: require('./lib/fields/text')
};