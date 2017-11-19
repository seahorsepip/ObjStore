const uuid = require('uuid');
if (!localStorage.getItem("objStore_objects")) localStorage.setItem("objStore_objects", JSON.stringify({}));
if (!localStorage.getItem("objStore_models")) localStorage.setItem("objStore_models", JSON.stringify({}));

module.exports = {
    create: (modelId, data) => {
        let objects = JSON.parse(localStorage.getItem("objStore_objects"));
        let id = uuid();
        return new Promise((resolve, reject) => {
            objects[id] = {
                id: id,
                model: modelId,
                data: data
            };
            localStorage.setItem("objStore_objects", JSON.stringify(objects));
            resolve(id);
        });
    },
    read: id => {
        let objects = JSON.parse(localStorage.getItem("objStore_objects"));
        return new Promise((resolve, reject) => {
            if (id === undefined) {
                resolve(Object.values(objects));
            } else if (objects[id]) {
                resolve(objects[id]);
            } else {
                reject('Error: object not found');
            }
        });
    },
    update: (id, data) => {
        let objects = JSON.parse(localStorage.getItem("objStore_objects"));
        return new Promise((resolve, reject) => {
            if (objects[id]) {
                objects[id].data = data;
                localStorage.setItem("objStore_objects", JSON.stringify(objects));
                resolve();
            } else {
                reject('Error: object not found');
            }
        });
    },
    drop: id => {
        let objects = JSON.parse(localStorage.getItem("objStore_objects"));
        return new Promise((resolve, reject) => {
            if (objects[id]) {
                delete objects[id];
                localStorage.setItem("objStore_objects", JSON.stringify(objects));
                resolve();
            } else {
                reject('Error: object not found');
            }
        });
    },
    models: {
        create: (name, fields) => {
            let id = uuid();
        },
        read: (id) => {

        },
        update: (id, data) => {

        },
        drop: (id) => {

        }
    }
};