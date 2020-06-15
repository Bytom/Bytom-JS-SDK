import {convertArgument, signTransaction} from '../wasm/func';
import { handleApiError, handleAxiosError } from '../utils/http';
import { getDB } from '../db/db';

function transactionSDK(bytom) {
    this.http = bytom.serverHttp;
    this.bytom = bytom;
}


/**
 * List all the transactions related to a wallet or an address.
 *
 * @see https://gist.github.com/HAOYUatHZ/0c7446b8f33e7cddd590256b3824b08f#apiv1btmmerchantlist-transactions
 * @param {String} guid unique id for each wallet
 * @param {String} filter (optional) if provided, will only return transactions the filter condition is related to
 * @param {String} sort (optional) if provided, will only return transactions the sort condition is related to
 * @param {Number} start page start
 * @param {Number} limit page limit
 * @returns {Promise}
 */
transactionSDK.prototype.list = function(address, filter,sort, start, limit) {
    let net = this.bytom.net;
    let pm = {}

    if (filter) {
        pm.filter = filter;
    }

    if (sort) {
        pm.sort = sort;
    }

    let url = 'merchant/transactions';
    let args = new URLSearchParams();
    if (typeof start !== 'undefined') {
        args.append('start', start);
    }
    if (limit) {
        args.append('limit', limit);
    }
    if (address) {
        args.append('address', address);
    }
    url = url + '?' + args.toString();
    return this.http.request(url, pm, net);
};

/**
 * Submit a signed transaction to the chain.
 *
 * @see https://gist.github.com/HAOYUatHZ/0c7446b8f33e7cddd590256b3824b08f#apiv1btmmerchantsubmit-payment
 * @param {String} guid unique id for each wallet
 * @param {String} raw_transaction raw transaction bytes encoded to string
 * @param {Array} signatures signed data of each signing instruction
 */
transactionSDK.prototype.submitPayment = function(address, raw_transaction, signatures) {
    let net = this.bytom.net;
    let pm = {raw_transaction: raw_transaction, signatures: signatures};
    return this.http.request(`merchant/submit-payment?address=${address}`, pm, net);
};

/**
 * Build a raw transaction transfered from the wallet. 
 * May use all available addresses (under the wallet) as source addresses if not specified.
 * 
 * @see https://gist.github.com/HAOYUatHZ/0c7446b8f33e7cddd590256b3824b08f#apiv1btmmerchantbuild-payment
 * @param {String} guid unique id for each wallet
 * @param {String} to destination address
 * @param {String} asset hexdecimal asset id
 * @param {Number} amount transfer amount
 * @param {Number} fee transaction fee amount
 * @param {Number} confirmations - transaction confirmations
 * @returns {Promise}
 */
transactionSDK.prototype.buildPayment = function(address, to, asset, amount, fee, confirmations, memo, forbidChainTx) {
    let net = this.bytom.net;
    let pm = {
        asset: asset,
        recipients: {},
        forbid_chain_tx: false
    };

    pm['recipients'][`${to}`] = amount

    if (memo) {
        pm.memo = memo;
    }
    if (forbidChainTx) {
        pm.forbid_chain_tx = forbidChainTx;
    }
    if (fee) {
        pm.fee = fee;
    }
    if (confirmations) {
        pm.confirmations = confirmations;
    }
    return this.http.request(`merchant/build-payment?address=${address}`, pm, net);
};

/**
 * Build a cross chain transaction.
 *
 * @param {String} guid unique id for each wallet
 * @param {String} to destination address
 * @param {String} asset hexdecimal asset id
 * @param {Number} amount transfer amount
 * @param {Number} confirmations - transaction confirmations
 * @returns {Promise}
 */
transactionSDK.prototype.buildCrossChain = function(address, to, asset, amount, confirmations, forbidChainTx) {
    let net = this.bytom.net;

    let pm = {
        asset: asset,
        recipients: {},
        forbid_chain_tx: false
    };

    pm['recipients'][`${to}`] = amount

    if (forbidChainTx) {
        pm.forbid_chain_tx = forbidChainTx;
    }

    return this.http.request(`merchant/build-crosschain?address=${address}`, pm, net);
};

/**
 * Build a Vote transaction.
 *
 * @param {String} guid unique id for each wallet
 * @param {String} vote pubkey vote
 * @param {String} memo memo key
 * @param {Number} amount transfer amount
 * @param {Number} confirmations - transaction confirmations
 * @returns {Promise}
 */
transactionSDK.prototype.buildVote = function(address, vote, amount, confirmations, memo, forbidChainTx) {
    let net = this.bytom.net;
    let pm = {vote, amount: amount, forbid_chain_tx: false};
    if (confirmations) {
        pm.confirmations = confirmations;
    }
    if (memo) {
        pm.memo = memo;
    }
    if (forbidChainTx) {
      pm.forbid_chain_tx = forbidChainTx;
    }

    return this.http.request(`merchant/build-vote?address=${address}`, pm, net);
};

/**
 * Build a Veto transaction.
 *
 * @param {String} guid unique id for each wallet
 * @param {String} vote pubkey vote
 * @param {String} memo memo key
 * @param {Number} amount transfer amount
 * @param {Number} confirmations - transaction confirmations
 * @returns {Promise}
 */
transactionSDK.prototype.buildVeto = function(address, vote, amount, confirmations, memo,  forbidChainTx) {
    let net = this.bytom.net;
    let pm = { vote, amount: amount, forbid_chain_tx: false};
    if (confirmations) {
        pm.confirmations = confirmations;
    }
    if (memo) {
        pm.memo = memo;
    }
      if (forbidChainTx) {
        pm.forbid_chain_tx = forbidChainTx;
      }

    return this.http.request(`merchant/build-veto?address=${address}`, pm, net);
};

/**
 * Advanced Build a raw transaction transfered from the wallet.
 * May use all available addresses (under the wallet) as source addresses if not specified.
 *
 * @param {String} guid unique id for each wallet
 * @param {Number} fee transaction fee amount
 * @returns {Promise}
 */
transactionSDK.prototype.buildTransaction = function(address, inputs, outputs, fee, confirmations, forbid_chain_tx = true) {
    let net = this.bytom.net;
    let pm = {
        inputs,
        outputs,
        forbid_chain_tx
    };
    if (fee) {
        pm.fee = fee;
    }
    if (confirmations) {
        pm.confirmations = confirmations;
    }
    return this.http.request(`merchant/build-advanced-tx?address=${address}`, pm, net);
};

/**
 * sign transaction
 * @param {String} guid
 * @param {String} transaction
 * @param {String} password
 * @returns {Object} signed data
 */
transactionSDK.prototype.signTransaction = function(guid, transaction, password) {
    let bytom = this.bytom;
    let retPromise = new Promise((resolve, reject) => {
        getDB().then(db => {
            let getRequest = db.transaction(['accounts-server'], 'readonly')
                .objectStore('accounts-server')
                .index('guid')
                .get(guid);
            getRequest.onsuccess = function(e) {
                if (!e.target.result) {
                    reject(new Error('not found guid'));
                    return;
                }
                bytom.sdk.keys.getKeyByXPub(e.target.result.rootXPub).then(res => {
                    let pm = {transaction: transaction, password: password, key: res};
                    signTransaction(pm).then(res => {
                        resolve(JSON.parse(res.data));
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            };
            getRequest.onerror = function() {
                reject(getRequest.error);
            };
        }).catch(error => {
            reject(error);
        });
    });
    return retPromise;
};

/**
 * Convert arguement.
 *
 * @param {String} type - type.
 * @param {String} value - value.
 */
transactionSDK.prototype.convertArgument = function(type, value) {
    let retPromise = new Promise((resolve, reject) => {
        let data = {};
        data.type = type;
        data.raw_data = JSON.stringify({value});
        convertArgument(data).then((res) => {
            let jsonData = JSON.parse(res.data);
            resolve(jsonData);
        }).catch(error => {
            reject(error);
        });
    });
    return retPromise;
};

export default transactionSDK;