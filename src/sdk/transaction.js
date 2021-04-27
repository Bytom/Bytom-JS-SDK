import {signTransaction as signJs} from '../utils/transaction/signTransaction';
import { camelize } from '../utils/utils';
import {convertArgument} from '../utils/convertArguement';
import {http} from '../http.js';



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
    let pm = {};

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
 * List all the transactions related to a wallet or an address.
 *
 * @see https://gist.github.com/HAOYUatHZ/0c7446b8f33e7cddd590256b3824b08f#apiv1btmmerchantlist-transactions
 * @param {String} baseUrl request url,
 * @param {String} address transaction address
 * @param {Number} start page start
 * @param {Number} limit page limit
 * @returns {Promise}
 */
transactionSDK.prototype.listDelayTransaction = function(baseUrl, address, start, limit) {
    const _http = new http(baseUrl)
    let pm = {};

    let path = '/lingerdesire/v1/list-delay-transfers';
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
    path = path + '?' + args.toString();
    return _http.request(path, pm);
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
 * @param {String|{[asset: string]: number}} to destination address
 * @param {String} asset hexdecimal asset id
 * @param {Number} amount transfer amount
 * @param {Number} fee transaction fee amount
 * @param {Number} confirmations - transaction confirmations
 * @returns {Promise}
 */
transactionSDK.prototype.buildPayment = function(address, to, asset, amount, confirmations, memo, forbidChainTx) {
    let net = this.bytom.net;
    let pm = {
        asset: asset,
        recipients: {},
        forbid_chain_tx: false
    };

    // transfer to multi address
    if (typeof to === 'object') {
        pm.recipients = to;
    } else {
        pm.recipients[to] = amount;
    }

    if (memo) {
        pm.memo = memo;
    }
    if (forbidChainTx) {
        pm.forbid_chain_tx = forbidChainTx;
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

    pm['recipients'][`${to}`] = amount;

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

transactionSDK.prototype.estimateFee = function(address, asset_amounts, confirmations=1) {
    console.log('estimateFee', arguments);
    let net = this.bytom.net;
    let pm = {asset_amounts, confirmations};

    return this.http.request(`merchant/estimate-tx-fee?address=${address}`, pm, net);
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


transactionSDK.prototype._signTransactionJs = function( transaction, password, key) {
    let tx = camelize(JSON.parse(transaction));

    return signJs(tx, password, key);
};

transactionSDK.prototype._signTransactionJsPromise = function( transaction, password, key) {
    let retPromise = new Promise((resolve, reject) => {
        try{
            let result = this._signTransactionJs(transaction, password, key);
            resolve(result);
        }
        catch(error) {
            reject(error);
        }
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
        try{
            const result = convertArgument(data).data
            resolve(result);
        }
        catch(error){
            reject(error);
        }
    });
    return retPromise;
};


export default transactionSDK;