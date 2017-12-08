//Let's not validate or transform values for now
module.exports.name = 'objstore-types-text';
module.exports.validate = (value, config) => new Promise((resolve, reject) => resolve(value));
module.exports.filter = (value, config) => new Promise((resolve, reject) => resolve(value));
module.exports.config = (config) => new Promise((resolve, reject) => resolve(config));