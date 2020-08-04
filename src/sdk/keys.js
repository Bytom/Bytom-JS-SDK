import { createKey ,resetKeyPassword, createPubkey, signMessage, signTransaction} from '../wasm/func';
import {getDB} from '../db/db';
import {createkey, isValidMnemonic} from '../utils/key/createKey';
import {encryptKey, decryptKey} from '../utils/key/keystore';
import { restoreFromKeyStore } from '../utils/account';
import { camelize } from '../utils/utils';


function keysSDK() {
}

/**
 * reset key password
 * 
 * @param {String}} rootXPub 
 * @param {String} oldPassword 
 * @param {String} newPassword 
 */
keysSDK.prototype.resetKeyPassword = function(rootXPub, oldPassword, newPassword) {
    let retPromise = new Promise((resolve, reject) => {
        let data = {rootXPub: rootXPub, oldPassword:oldPassword, newPassword:newPassword};
        resetKeyPassword(data).then(res => {
            getDB().then(db => {
                let objectStore = db.transaction(['keys'], 'readwrite').objectStore('keys');
                let index = objectStore.index('xpub');
                let keyRange = IDBKeyRange.only(rootXPub);
                let getRequest = index.openCursor(keyRange);
                getRequest.onsuccess = function (event) {
                    const cursor = event.target.result;
                    if(cursor && cursor.value.xpub === rootXPub) {
                        const updateData = cursor.value;
                        updateData.key = res.data;
                        const request = cursor.update(updateData);
                        request.onsuccess = function() {
                            resolve(true);
                        };
                        request.onerror = function() {
                            reject(new Error('db update error'));
                        };
                    } else {
                        reject(new Error('db update error: not found by rootXPub'));
                    }
                };
                getRequest.onerror = function () {
                    reject(new Error('db get error'));
                };
            }).catch(error => {
                reject(error);
            });
        }).catch(error => {
            reject(error);
        });
    });
    return retPromise;
};

/**
 * get key by XPub
 * 
 * @param {String} xpub 
 */
keysSDK.prototype.getKeyByXPub = function(xpub) {
    let retPromise = new Promise((resolve, reject) => {
        getDB().then(db => {
            let getRequest = db.transaction(['keys'], 'readonly')
                .objectStore('keys')
                .index('xpub')
                .get(xpub);
            getRequest.onsuccess = function(e) {
                if(e.target.result) {
                    resolve(e.target.result.key);
                } else {
                    reject(new Error('not found by XPub'));    
                }
            };
            getRequest.onerror = function() {
                reject(new Error('db get error'));
            };
        }).catch(error => {
            reject(error);
        });
    });
    return retPromise;
};

/**
 * List key
 *
 * @returns {Promise}
 */
keysSDK.prototype.list = function() {
    let retPromise = new Promise((resolve, reject) => {
        getDB().then(db => {
            let transaction = db.transaction(['keys'], 'readonly');
            let objectStore = transaction.objectStore('keys');
            let oc = objectStore.openCursor();
            let ret = [];
            oc.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    ret.push({alias: cursor.value.alias, xpub: cursor.value.xpub});
                    cursor.continue();
                } else {
                    resolve(ret);
                }
            };
            oc.onerror = function(e){
                reject(e);
            };
        }).catch(err => {
            reject(err);
        });
    });
    return retPromise;
};

/**
 * Create a new key.
 *
 * @param {String} alias - User specified, unique identifier.
 * @param {String} password - User specified, key password.
 */
keysSDK.prototype.createKey = function(alias, password) {
    var normalizedAlias = alias.toLowerCase().trim();

    let data = {};
    data.alias = normalizedAlias;
    data.password = password;
    const res = createkey(data);
    return res;
};

/**
 * Create a new key.
 *
 * @param {String} alias - User specified, unique identifier.
 * @param {String} password - User specified, key password.
 */
keysSDK.prototype.restoreFromMnemonic = function(alias, password, mnemonic) {
    var normalizedAlias = alias.toLowerCase().trim();

    let data = {};
    data.alias = normalizedAlias;
    data.password = password;
    data.mnemonic = mnemonic;

    const res = createkey(data);
    return res;
};

/**
 * Create a new key.
 *
 * @param {String} alias - User specified, unique identifier.
 * @param {String} password - User specified, key password.
 */
keysSDK.prototype.restoreFromKeystore = function( password, keystore) {

    const result = decryptKey(keystore, password);
    result.xpub = result.xPub.toString('hex');
    delete result['xPub'];

    return result;
};

/**
 * Create a new key.
 *
 * @param {String} keystore - User specified, unique identifier.
 */
keysSDK.prototype.isValidKeystore = function(  keystore ) {

    const walletImage = camelize(JSON.parse(keystore));

    let keys, key;
    if(walletImage.keyImages && walletImage.keyImages.xkeys ){
        keys = walletImage.keyImages.xkeys;
    }

    // match older version of backups keystore files
    else if(walletImage.keys>0){
        keys = walletImage.keys.map(keyItem => JSON.parse( keyItem.key ) );
    }else{
        key  = walletImage;
    }

    if(keys){
        if(keys.length>1){
            throw 'do not support multiple keystore imported.';
        }
        else if(keys.length === 1){
            key = keys[0];
        }
    }

    return key;
};

/**
 * Create a new key.
 *
 * @param {String} alias - User specified, unique identifier.
 * @param {String} password - User specified, key password.
 */
keysSDK.prototype.isValidMnemonic = function(mnemonic) {

    return isValidMnemonic(mnemonic);
};

/**
 * Create a new key.
 * 
 * @param {String} alias - User specified, unique identifier.
 * @param {String} password - User specified, key password.
 */
keysSDK.prototype.create = function(alias, password) {
    var normalizedAlias = alias.toLowerCase().trim();
    let retPromise = new Promise((resolve, reject) => {
        getDB().then(db => {
            let getRequest = db.transaction(['keys'], 'readonly')
                .objectStore('keys')
                .index('alias')
                .get(normalizedAlias);
            getRequest.onsuccess = function (e) {
                if (e.target.result) {
                    reject(new Error('key alias already exists'));
                    return;
                }
                let data = {};
                data.alias = normalizedAlias;
                data.auth = password;
                createKey(data).then((res) => {
                    let jsonData = JSON.parse(res.data);
                    let dbData = {
                        key:res.data,
                        xpub:jsonData.xpub,
                        alias:alias,
                    };
                    let request = db.transaction(['keys'], 'readwrite')
                        .objectStore('keys')
                        .add(dbData);
                    request.onsuccess = function () {
                        resolve({xpub:jsonData.xpub, alias: alias});
                    };
                    request.onerror = function () {
                        reject(new Error('db insert error'));
                    };
                }).catch(error => {
                    reject(error);    
                });
            };
            getRequest.onerror = function () {
                reject(new Error('db get error'));
            };
        }).catch(error => {
            reject(error);
        });
    });
    return retPromise;
};


/**
 * Create a new key.
 *
 * @param {String} xpub - xpub.
 */
keysSDK.prototype.createPubkey = function(xpub) {
    let retPromise = new Promise((resolve, reject) => {
        let data = {};
        data.xpub = xpub;
        data.seed = 1;
        createPubkey(data).then((res) => {
            let jsonData = JSON.parse(res.data);
            resolve(jsonData);
        }).catch(error => {
            reject(error);
        });
    });
    return retPromise;
};

/**
 * Sign Message.
 *
 * @param {String} message - message.
 * @param {String} password - password.
 * @param {Object} address - address.
 */
keysSDK.prototype.signMessage = function(message, password, address) {
    let retPromise = new Promise((resolve, reject) => {
        getDB().then(db => {
            let getRequest = db.transaction(['accounts-server'], 'readonly')
                .objectStore('accounts-server')
                .getAll();

            getRequest.onsuccess = function (e) {
                const result = getRequest.result.filter(obj => (obj.address === address || obj.vpAddress === address));
                if (result.length === 0) {
                    reject(new Error('not found address'));
                    return;
                }

                const rootXpub = result[0].rootXPub;
                let keyObject = db.transaction(['keys'], 'readonly')
                    .objectStore('keys')
                    .index('xpub')
                    .get(rootXpub);

                keyObject.onsuccess = function (e) {
                    if (!e.target.result) {
                        reject(new Error('not found xpub'));
                        return;
                    }

                    let data = {};
                    data.message = message;
                    data.password = password;
                    data.key = e.target.result.key;
                    signMessage(data).then((res) => {
                        let jsonData = JSON.parse(res.data);
                        resolve(jsonData);
                    }).catch(error => {
                        reject(error);
                    });
                };
                keyObject.onerror = function () {
                    reject(getRequest.error);
                };
            };
            getRequest.onerror = function () {
                reject(getRequest.error);
            };
        }).catch(error => {
            reject(error);
        });
    });
    return retPromise;
};

export default keysSDK;