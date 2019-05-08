import queryApi from './api/query.js';
import accountsApi from './api/accounts.js';
import transactionsApi from './api/transactions.js';
import keysApi from './api/keys.js';
import keysSDK from './sdk/keys.js';
import accountsSDK from './sdk/accounts.js';
import transactionSDK from './sdk/transaction.js';
import walletSDK from './sdk/wallet.js';
import querySDK from './sdk/query.js';
import {serverHttp, http} from './http.js';

function Bytom(serverHost, wasmPath, baseURL) {
    this.install = function(Vue) {
        Vue.prototype.$Bytom = this;
    };
    
    if(baseURL) {
        this.http = new http(baseURL);
        this.query = new queryApi(this.http);
        this.accounts = new accountsApi(this.http);
        this.keys = new keysApi(this.http);
        this.transactions = new transactionsApi(this.http);
    }

    this.net = 'main';
    Bytom.wasmPath = wasmPath;
    this.serverHttp = new serverHttp(serverHost);
    this.sdk = {};
    this.sdk.keys = new keysSDK();
    this.sdk.accounts = new accountsSDK(this);
    this.sdk.transaction = new transactionSDK(this);
    this.sdk.wallet = new walletSDK(this);
    this.sdk.query = new querySDK(this);
}


/**
 * Get net type;
 *
 * @returns Network
 */
Bytom.prototype.getNetType = function() {
    return this.net;
};

/**
 * Set net type
 *
 * @param {String} net net type (main test)
 * @returns {Promise}
 */
Bytom.prototype.setNetType = function(net) {
    this.net = net;
};

export default Bytom;