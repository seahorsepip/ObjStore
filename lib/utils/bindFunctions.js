module.exports = (methods, context) => {
    let binds = {};
    Object.keys(methods).forEach(key => binds[key] = methods[key].bind(context));
    return binds;
};