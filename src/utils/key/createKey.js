const bip39 = require('bip39');
const utils = require('./utils');

const WORDLISTS = {
    en: require('bip39/src/wordlists/english.json'),
    zh: require('bip39/src/wordlists/chinese_simplified.json')
};

const keystore  = require('./keystore');

const EntropyLength = 128;
const LightScryptN = 1 << 12;
const LightScryptP = 6;

function createkey({
    alias,
    password,
    mnemonic,
    language
})  {
    if(!language){
        language = 'en';
    }

    if (mnemonic && mnemonic.length > 0 ){
        return importKeyFromMnemonic(alias,password, mnemonic, language);
    }

    let obj = createNewKey(alias, password, language);
    return {alias: obj.alias, xpub: obj.xPub.toString('hex'), keystore: obj.keystore, mnemonic:obj.mnemonic};
}

function importKeyFromMnemonic(alias, password, mnemonic, language) {
    // checksum length = entropy length /32
    // mnemonic length = (entropy length + checksum length)/11
    let mnemArray = mnemonic.trim().split(' ');
    if (mnemArray.length != ((EntropyLength+EntropyLength/32)/11 )){
        throw 'mnemonic length error';
    }

    // Pre validate that the mnemonic is well formed and only contains words that
    // are present in the word list
    if (!bip39.validateMnemonic(mnemonic,  WORDLISTS[language])) {
        throw 'mnemonic is invalid';
    }

    return createKeyFromMnemonic(alias, password, mnemonic);
}

function  createKeyFromMnemonic(alias,password, mnemonic) {
    // Generate a Bip32 HD wallet for the mnemonic and a user supplied password
    let seed = bip39.mnemonicToSeedSync(mnemonic, '');
    let {xprv, xpub} = utils.newXKeys(seed);
    let key = {
        keyType: 'bytom_kd',
        xPub:    xpub,
        xPrv:    xprv.xprv,
        alias
    };
    let _keystore = keystore.encryptKey( key, password, LightScryptN, LightScryptP);

    return {xPub: xpub.toString('hex'), alias, keystore: _keystore};
}

function createNewKey(alias, password, language) {
    let normalizedAlias = alias.trim().toLowerCase();
    return createChainKDKey(normalizedAlias, password, language);
}

function createChainKDKey(alias,password, language){
    // Generate a mnemonic for memorization or user-friendly seeds
    let mnemonic = bip39.generateMnemonic(EntropyLength,undefined, WORDLISTS[language]);

    let object = createKeyFromMnemonic(alias, password, mnemonic);
    object.mnemonic = mnemonic

    return object;
}

export {
    createkey,
    importKeyFromMnemonic,
    createNewKey
};
