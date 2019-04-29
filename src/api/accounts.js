/**
 * Represents a accountsApi.
 * @constructor
 */
function accountsApi(http) {
    this.http = http;
}


/**
 * Create a new account.
 *
 * @param {Object} params - Parameters for accounts create.
 * @param {String} params.pubkey - key pubkey,
 * @param {String} params.label  - Optional. Account alias.
 * @param {String} params.email - Optional. The account email
 * @returns {Promise} Guid, address, label
 */
accountsApi.prototype.create = function(params) {
    return this.http.request('account/create-account', params);
};

/**
 * Create a new address.
 *
 * @param {Object} params - Parameters for address create.
 * @param {String} params.guid - AccountID,
 * @param {String} params.label  - Optional. Account alias.
 * @returns {Promise} Guid, address, label
 */
accountsApi.prototype.createAddress = function(params) {
    return this.http.request('account/create-address', params);
};

/**
 * List all addresses for one account.
 * 
 * @param {String} Guid - id of account.
 * @returns {Promise} Array of Object, with Guid, Address, label, Balance.
 */
accountsApi.prototype.listAddresses = function(Guid) {
    return this.http.request('account/list-addresses', {Guid});
};

export default accountsApi;