const uuid = require('uuid');
const objectsKey = 'objStore_objects';
const modelsKey = 'objStore_models';

if (!localStorage.getItem(objectsKey)) localStorage.setItem(objectsKey, JSON.stringify({}));
if (!localStorage.getItem(modelsKey)) localStorage.setItem(modelsKey, JSON.stringify({}));

const create = (key, data, item) => new Promise((resolve, reject) => {
    let entries = JSON.parse(localStorage.getItem(item));
    entries[key] = data;
    localStorage.setItem(item, JSON.stringify(entries));
    resolve(key);
});

const read = (key, item) => new Promise((resolve, reject) => {
    let entries = JSON.parse(localStorage.getItem(item));
    if (key === undefined) {
        resolve(Object.values(entries));
    } else if (entries[key]) {
        resolve(entries[key]);
    } else {
        reject();
    }
});

module.exports = {
    create: (modelId, data) => {
        let id = uuid();
        return create(id, {id, modelId, data}, objectsKey);
    },
    read: id => read(id, objectsKey).catch(() => {
        throw new Error('Object not found');
    }),
    update: (id, data) => {
        let objects = JSON.parse(localStorage.getItem(objectsKey));
        return new Promise((resolve, reject) => {
            if (objects[id]) {
                objects[id].data = data;
                localStorage.setItem(objectsKey, JSON.stringify(objects));
                resolve();
            } else {
                reject('Error: object not found');
            }
        });
    },
    drop: id => {
        let objects = JSON.parse(localStorage.getItem(objectsKey));
        return new Promise((resolve, reject) => {
            if (objects[id]) {
                delete objects[id];
                localStorage.setItem(objectsKey, JSON.stringify(objects));
                resolve();
            } else {
                reject('Error: object not found');
            }
        });
    },
    models: {
        create: (name, data) => {
            let id = uuid();
            return create(id, {id, name, data}, modelsKey);
        },
        read: (id) => read(id, modelsKey).catch(() => {
            throw new Error('Model not found');
        }),
        update: (id, data) => {
            //TODO implement update
        },
        drop: (id) => {
            //TODO implement drop
        }
    }
};