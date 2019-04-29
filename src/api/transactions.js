/**
 * Represents a transactionsApi.
 * @constructor
 */
import {convertArguements} from '../utils/convertArguement';

function transactionsApi(http) {
    this.http = http;
}

/**
 * List local transactions by id.
 *
 * @param {Object} params - list transactions with account information.
 * @param {String} params.Guid - Transaction related account id.
 * @param {Object} params.filter - Optional, filter condition amount or time.
 * @param {String} params.sort - Optional, sort condition.
 */
transactionsApi.prototype.list = function(params) {
    return this.http.request('account/list-transactions', params);
};

/**
 * Build Payment.
 *
 * @param {Object} params - Parameters for build payment.
 * @param {String} params.guid - Account Guid.
 * @param {String} params.asset - Asset ID.
 * @param {Number} params.amount - Amount in neu.
 * @param {String} params.to - send to address
 * @param {Number} params.fee - Gas fee.
 * @param {Number} params.confirmations - Confirmations.
 *
 * @return {promise} Object with raw_transaction, signing_instructions, fee
 */
transactionsApi.prototype.buildPayment = function(params) {
    return this.http.request('/merchant/build-payment', params);
};

/**
 * Build transaction.
 *
 * @param {Object} params - Parameters for build transaction.
 * @param {String} params.guid - Account Guid.
 * @param {String} params.asset - Asset ID.
 * @param {Object[]} params.inputs - Amount in neu.
 * @param {Object[]} params.outputs - send to address
 * @param {Number} params.fee - Gas fee.
 * @param {Number} params.confirmations - Confirmations.
 *
 * @return {promise} Object with raw_transaction, signing_instructions, fee
 */
transactionsApi.prototype.buildTransaction = function(params) {
    return this.http.request('/merchant/build-transaction', params);
};

/**
 * convert contract argument.
 *
 * @param {Object} obj - Argument Object
 * @param {String} obj.type - Argument Type, included data, address, string, integer, boolean.
 * @param {String|Number|Boolean}- obj.raw_data.value - data value
 */
transactionsApi.prototype.convertArguement = function (obj) {
    return convertArguements(obj);
}

/**
 * Submit a signed transaction to the blockchain.
 * 
 * @see https://github.com/Bytom/bytom/wiki/API-Reference#submit-transaction·
 *
 * @param {Object} params - Parameters for build payment.
 * @param {String} params.guid - Account Id.
 * @param {String} params.raw_transaction - raw_transaction of signed transaction.
 * @param {String[]} params.signatures - transaction signature
 * @param {String} params.memo - custom memo that only saved in the server.
 *
 * @return {promise} transaction_hash
 */
transactionsApi.prototype.submit = function(params) {
    return this.http.request('/account/submit-payment', params);
};


export default transactionsApi;