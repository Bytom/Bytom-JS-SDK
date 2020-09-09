import { restoreFromKeyStore } from '../utils/account';

function walletSDK(bytom) {
    this.http = bytom.serverHttp;
    this.bytom = bytom;
}

walletSDK.prototype.list = function(pubkey) {
    let net = this.bytom.net;
    let pm = {pubkey};
    return this.http.request('account/wallets', pm, net);
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

export default walletSDK;