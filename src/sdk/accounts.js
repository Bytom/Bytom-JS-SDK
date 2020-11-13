import {getDB} from '../db/db';

function accountsSDK(bytom){
    this.http = bytom.serverHttp;
    this.bytom = bytom;
}

/**
 * List of the account.
 *
 * @returns {Promise} List of Accounts
 */
accountsSDK.prototype.listAccountUseServer = function() {
    let net = 'mainnet';
    // let net = 'testnet';
    let retPromise = new Promise((resolve, reject) => {
        getDB().then(db => {
            let transaction = db.transaction(['accounts-server'], 'readonly');
            let objectStore = transaction.objectStore('accounts-server').index('net');
            let keyRange = IDBKeyRange.only(net);
            let oc = objectStore.openCursor(keyRange);
            let ret = [];

            oc.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    ret.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(ret);
                }
            };
            oc.onerror = function(e){
                reject(e);
            };
        }).catch(error => {
            reject(error);
        });
    });
    return retPromise;
};

/**
 * List all addresses and the corresponding balances of a wallet.
 *
 * @see https://gist.github.com/HAOYUatHZ/0c7446b8f33e7cddd590256b3824b08f#apiv1btmaccountlist-addresses
 * @param {String} guid
 * @returns {Promise} list of all addresses
 */
accountsSDK.prototype.listAddressUseServer = function(address) {
    let net = this.bytom.net;
    return this.http.request(`account/address?address=${address}`, '', net, 'GET');
};

/**
 * Create a wallet using a public key. Each wallet is identified by a guid. (by server)
 *
 * @see https://gist.github.com/HAOYUatHZ/0c7446b8f33e7cddd590256b3824b08f#endpoints
 * @param {String} rootXPub
 * @param {String} alias alias for the account
 * @param {String} label alias for the first address
 * @returns {Promise}
 */
accountsSDK.prototype.createNewAccount = function(rootXPub, label) {
    let net = this.bytom.net;
    let pm = {pubkey: rootXPub};
    if (label) {
        pm.label = label;
    }
    return this.http.request('account/create', pm, net);
};


/**
 * Create a wallet using a public key. Each wallet is identified by a guid. (by server)
 *
 * @param {String} guid
 * @param {String} coin type of coin
 * @returns {Promise}
 */
accountsSDK.prototype.copyAccountUseServer = function(guid, coin) {
    let net = this.bytom.net;
    let pm = {guid};
    if (coin) {
        pm.coin = coin;
    }

    return  this.http.request('account/copy', pm, net);
};


export default accountsSDK;