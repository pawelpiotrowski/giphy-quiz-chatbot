'use strict';

const localStorage = require('localstorage-memory');

module.exports = {
    updateUser(update) {
        return new Promise(resolve => {
            this.getUser(update.fbid)
            .then(usr => {
                let updatedUsr = Object.assign(usr, update);
                return this.setUser(updatedUsr);
            })
            .then(updated => {
                resolve(updated);
            });
        });
    },
    getUser(usrId) {
        return new Promise(resolve => {
            let storedUsr = localStorage.getItem('id' + usrId);
            if(storedUsr) {
                storedUsr = JSON.parse(storedUsr);
            }
            resolve(storedUsr);
        });
    },
    setUser(usr) {
        return new Promise(resolve => {
            const newUsr = JSON.stringify(usr);
            localStorage.setItem('id' + usr.fbid, newUsr);
            resolve(JSON.parse(newUsr));
        });
    }
};
