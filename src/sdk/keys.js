import {createkey, isValidMnemonic} from '../utils/key/createKey';
import { decryptKey} from '../utils/key/keystore';
import { camelize } from '../utils/utils';
import CryptoJS from 'crypto-js';
import {signMessage as signMJs} from '../utils/transaction/signMessage';
import Error from '../utils/error';


function keysSDK() {
}

/**
 * Create a new key.
 *
 * @param {String} alias - User specified, unique identifier.
 * @param {String} password - User specified, key password.
 */
keysSDK.prototype.createKey = function(alias, password) {
    var normalizedAlias = alias.toLowerCase().trim();

    let data = {};
    data.alias = normalizedAlias;
    data.password = password;
    const res = createkey(data);

    res.vault = this.encryptMnemonic(res.mnemonic, password, res.keystore);

    return res;
};

/**
 * Create a new key.
 *
 * @param {String} alias - User specified, unique identifier.
 * @param {String} password - User specified, key password.
 */
keysSDK.prototype.restoreFromMnemonic = function(alias, password, mnemonic) {
    var normalizedAlias = alias.toLowerCase().trim();

    let data = {};
    data.alias = normalizedAlias;
    data.password = password;
    data.mnemonic = mnemonic;

    const res = createkey(data);

    res.vault = this.encryptMnemonic(mnemonic, password, res.keystore);
    return res;
};

/**
 * Create a new key.
 *
 * @param {String} alias - User specified, unique identifier.
 * @param {String} password - User specified, key password.
 */
keysSDK.prototype.restoreFromKeystore = function( password, keystore) {

    const result = decryptKey(keystore, password);
    result.xpub = result.xPub.toString('hex');
    delete result['xPub'];

    return result;
};


/**
 * Create a new key.
 *
 * @param {String} alias - User specified, unique identifier.
 * @param {String} password - User specified, key password.
 */
keysSDK.prototype.encryptMnemonic = function(mnemonic, password, keystore) {

    const result = decryptKey(keystore, password);
    const xprv = result.xPrv.toString('hex');

    const ciphertext = CryptoJS.AES.encrypt(mnemonic, xprv);

    return ciphertext.toString();
};

/**
 * Create a new key.
 *
 * @param {String} alias - User specified, unique identifier.
 * @param {String} password - User specified, key password.
 */
keysSDK.prototype.decryptMnemonic = function(ciphertext, password, keystore) {

    const result = decryptKey(keystore, password);
    const xprv = result.xPrv.toString('hex');


    const bytes = CryptoJS.AES.decrypt(ciphertext, xprv);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);

    return plaintext;
};



/**
 * Create a new key.
 *
 * @param {String} keystore - User specified, unique identifier.
 */
keysSDK.prototype.isValidKeystore = function(  keystore ) {

    const walletImage = camelize(JSON.parse(keystore));

    let keys, key;
    if(walletImage.keyImages && walletImage.keyImages.xkeys ){
        keys = walletImage.keyImages.xkeys;
    }

    // match older version of backups keystore files
    else if(walletImage['accounts-server']){
        keys = walletImage.keys.map(keyItem => JSON.parse( keyItem.key ) );
    }else{
        key  = walletImage;
    }

    if(keys){
        if(keys.length>1){
            throw new Error('do not support multiple keystore imported.', 'BTM3004');
        }
        else if(keys.length === 1){
            key = keys[0];
        }
    }

    return key;
};

/**
 * Create a new key.
 *
 * @param {String} alias - User specified, unique identifier.
 * @param {String} password - User specified, key password.
 */
keysSDK.prototype.isValidMnemonic = function(mnemonic) {

    return isValidMnemonic(mnemonic);
};

/**
 * Create a new key.
 *
 * @param {String} alias - User specified, unique identifier.
 * @param {String} password - User specified, key password.
 */
keysSDK.prototype.verifyPassword = function(keystore, password) {
    try{
        decryptKey(keystore, password);
    }catch (e){
        return false;
    }
    return true;
};

/**
 * Sign Message.
 *
 * @param {String} message - message.
 * @param {String} password - password.
 * @param {Object} address - address.
 */
keysSDK.prototype.signMessageJs = function(message, password, keystore) {
    return signMJs(message, password, keystore);
};

keysSDK.prototype.signMessageJsPromise = function(message, password, keystore) {
    let retPromise = new Promise((resolve, reject) => {
        try{
            let result = this.signMessageJs(message, password, keystore);
            resolve(result);
        }
        catch(error) {
            reject(error);
        }
    });

    return retPromise;
};

export default keysSDK;