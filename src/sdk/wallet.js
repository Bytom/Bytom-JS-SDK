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


            let promiseList = [];
            for(let dbName of backupDBList){
                promiseList.push(backupDB(dbName));
            }

            Promise.all([promiseList]).then(([keyData, AccountData]) =>{
                walletImage['key_images']['xkeys'] = keyData.map(a => JSON.parse(a.key));
                walletImage['account_image']['assets'] = AccountData.map(a => {
                    return {
                        'account':{
                            'type':'account',
                            'xpubs':[
                                a.rootXPub
                            ],
                            'quorum':1,
                            'id':'byone-',
                            'alias':a.alias,
                            'keyIndex':1
                        },'contractIndex':1
                    };
                });

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
    const walletImage = JSON.parse(keystore);
    let net = this.bytom.net;

    let keys;
    if(walletImage.key_images && walletImage.key_images.xkeys){
        keys = walletImage.key_images.xkeys;
    }

    // match older version of backups keystore files
    else{
        keys = walletImage.keys.map(keyItem => JSON.parse( keyItem.key ) );
    }

    let promiseList = [];
    for (let index = 0; index< keys.length; index++ ){
        const pubkey = restoreFromKeyStore(keys[index], password[index]);
        promiseList.push(this.http.request('account/list-wallets', {pubkey}, net).catch(e => {throw e;}));
    }
    return Promise.all(promiseList).then(resp => resp.guid);

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