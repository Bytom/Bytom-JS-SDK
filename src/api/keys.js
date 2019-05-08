import {createKey, resetKeyPassword, createPubkey} from '../wasm/func';

/**
 * Represents a keysApi.
 * @constructor
 */
function keysApi(http) {
    this.http = http;
}

/**
 * Create a new key, will generate the xpub.
 *
 * @param {Object} params - Parameters for accounts create.
 * @param {String} params.alias - key alias,
 * @param {String} params.password  - key Password.
 * @returns {Promise} key alias, key xpub
 */
keysApi.prototype.create = function(params) {
    let inputParams = params
    inputParams.auth = params.password
    delete(inputParams['password'])
    let promise = new Promise((resolve, reject) => {
        createKey(inputParams).then(resp =>{
            let jsonData = JSON.parse(resp.data);
            const result = {
                alias: jsonData.alias,
                xpub: jsonData.xpub,
                crypto: jsonData.crypto
            };
            resolve(result);
        }).catch(error => {
            reject(error);
        });
    });

    return promise;
};

/**
 * Reset key password, will generate the new xpub.
 *
 * @param {Object} params - Parameters for accounts create.
 * @param {String} params.xpub - key alias,
 * @param {String} params.oldPassword  - key oldPassword.
 * @param {String} params.newPassword  - key newPassword.
 * @param {Object} params.crypto - key crypto
 * @returns {Promise} key alias, key xpub
 */
keysApi.prototype.resetKeyPassword = function(params) {
    let inputParams = params
    inputParams.rootXPub = params.xpub
    delete(inputParams['xpub'])
    let promise = new Promise((resolve, reject) => {
        resetKeyPassword(inputParams).then(resp =>{
            let jsonData = JSON.parse(resp.data);
            const result = {
                alias: jsonData.alias,
                xpub: jsonData.xpub,
                crypto: jsonData.crypto
            };
            resolve(result);
        }).catch(error => {
            reject(error);
        });
    });

    return promise;
};

/**
 * Create a new key.
 *
 * @param {String} xpub - xpub.
 * @returns {Promise} xpub, pubkey, derived_path
 *
 */
keysApi.prototype.createPubkey = function(xpub) {
    let retPromise = new Promise((resolve, reject) => {
        let data = {};
        data.xpub = xpub;
        data.seed = 1;
        createPubkey(data).then((resp) => {
            let jsonData = JSON.parse(resp.data);
            resolve(jsonData);
        }).catch(error => {
            reject(error);
        });
    });
    return retPromise;
};

export default keysApi;