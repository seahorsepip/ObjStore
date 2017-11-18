//Let's not validate or transform values for now
module.exports.name = 'objstore-fields-name';
module.exports.get = (value, config) => new Promise((resolve, reject) => resolve(value));
module.exports.set = (value, config) => new Promise((resolve, reject) => resolve(value));