/**
 * Represents a balancesApi.
 * @constructor
 */
function queryApi(http) {
    this.http = http;
}

/**
 * List Utxo
 *
 * @param {Object} params - list Utxo condition.
 * @param {Object} params.filter,
 *                  - script
 *                  - asset
 * @param {Object} params.sort,
 *                  - by
 *                  - order
 * @returns {Promise} hash, asset, amount
 */
queryApi.prototype.listUTXO =function(params) {
    return this.http.request('q/list-utxo', params);
};

/**
 * list all asset
 * @returns {Promise} assetID, assetAlias, price
 */
queryApi.prototype.listAsset =function() {
    return this.http.request('q/asset', {}, 'GET');
};

/**
 * get current block status
 * @returns {Promise} block_height, block_hash
 */
queryApi.prototype.getblockstatus =function() {
    return this.http.request('q/chain-status', {}, 'GET');
};

export default queryApi;