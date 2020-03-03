import {initDB, getDB} from '../db/db';
import { restoreFromKeyStore } from '../utils/account';

function walletSDK(bytom) {
    this.http = bytom.serverHttp;
    this.bytom = bytom;
}

let backupDBList = ['keys', 'accounts-server'];

/**
 * backup wallet.
 */
walletSDK.prototype.backup = function() {
    let retPromise = new Promise((resolve, reject) => {
        initDB().then(() =>{
            let walletImage = {
                key_images:{ xkeys:[] },
                account_image:{ assets:[] },
                asset_image:{ slices:[] }
            };
            backupDB('keys').then(data => {
                walletImage['key_images']['xkeys'] = data.map(a => JSON.parse(a.key));
                resolve(JSON.stringify(walletImage));
            }).catch(error => {
                reject(error);
            });
        });
    });
    return retPromise;
};

/**
 * Restore wallet.
 *
 * @param {String} walletImage
 */
walletSDK.prototype.restore = function(keystore, password) {
    const walletImage = JSON.parse(keystore)
    let net = this.bytom.net;
    if(walletImage.key_images && walletImage.key_images.xkeys){
        let promiseList = [];
        for (let key of walletImage.key_images.xkeys){
            const pubkey = restoreFromKeyStore(key, password);
            promiseList.push(this.http.request('account/list-wallets', {pubkey}, net).catch(e => {throw e}));
        }

        return Promise.all(promiseList).then(resp => resp.guid);

    }else{
        let retPromise = new Promise((resolve, reject) => {
            this.bytom.sdk.keys.list().then(keys => {
                if (keys.length <=0) {
                    let data = JSON.parse(walletImage);
                    let promiseList = [];
                    for (let key in data) {
                        if (!data.hasOwnProperty(key) || backupDBList.indexOf(key) === -1) {
                            continue;
                        }
                        promiseList.push(restoreDB(key, data[key]));
                    }
                    let retData = {};

                    Promise.all(promiseList).then(res => {
                        for(let index = 0; index < res.length; ++index) {
                            let data = res[index];
                            retData[data.name] = data.err;
                        }
                        resolve(retData);
                    }).catch(err => {
                        reject(err);
                    });
                } else {
                    reject(new Error('The wallet already has account data. Can\'t restore.'));
                }
            }).catch(error => {
                reject(error);
            });
        });
        return retPromise;
    }
};

function backupDB(dbname) {
    let ret = new Promise((resolve, reject) => {
        getDB().then(db => {

            let transaction = db.transaction([dbname], 'readonly');
            let objectStore = transaction.objectStore(dbname);
            let oc = objectStore.openCursor();
            let data = [];
            oc.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    data.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(data);
                }
            };
            oc.onerror = function(e){
                reject(e);
            };
        }).catch(err => {
            reject(err);
        });
    });
    return ret;
}

function restoreDB(dbname, data) {
    let ret = new Promise((resolve, reject) => {
        getDB().then(db => {
            let index = 0;
            let errList = [];
            batchAdd();

            function batchAdd() {
                if (index >= data.length) {
                    let r = {name: dbname, err: errList};
                    resolve(r);
                    return;
                }
                let transaction = db.transaction([dbname], 'readwrite');
                let objectStore = transaction.objectStore(dbname);
                let req = objectStore.add(data[index]);
                req.onsuccess = batchAdd;
                req.onerror = function() {
                    // if error continue add
                    errList.push(req.error);
                    batchAdd();
                };
                index++;
            }
        }).catch(err => {
            reject(err);
        });
    });
    return ret;
}

export default walletSDK;