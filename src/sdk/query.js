function querySDK(bytom) {
    this.bytom =bytom; 
    this.http = bytom.serverHttp;
}
/**
 * Query the price of an asset on a given blockchain. asset_id is a hexdecimal string.
 *
 * @param {String} asset_id
 */
querySDK.prototype.asset = function(asset_id) {
    let net = this.bytom.net;
    return this.http.request('q/asset?id=' + asset_id, null, net, 'GET');
};

/**
 * Query the current height of a blockchain.
 */
querySDK.prototype.getblockcount = function() {
    let net = this.bytom.net;
    return this.http.request('q/chain-status', null, net, 'GET');
};

/**
 * Query the current utxo.
 */
querySDK.prototype.listUtxo = function(object) {
    let net = this.bytom.net;
    return this.http.request('q/list-utxos',object, net,  'POST');
};

/**
 * Query the vote status.
 * vapor only
 */
querySDK.prototype.getVoteStatus = function() {
    let net = this.bytom.net;
    return this.http.request('q/vote-status',null, net,  'GET');
};

export default querySDK;