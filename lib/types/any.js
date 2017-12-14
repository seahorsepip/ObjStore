module.exports = {
    id: 'any',
    name: 'Any',
    description: 'Any data without structure and/or validation',
    validate: (value, config) => new Promise(resolve => {
        console.log(`Validating '${value}' with config '${config}'`);
        resolve(value);
    }),
    config: config => Promise.resolve(config)
};