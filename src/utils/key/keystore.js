let cryp = require('crypto-browserify');
let scrypt = require('scrypt-js');
import {XPrv} from './chainkd';
let sha3_256 = require('js-sha3').sha3_256;
import _ from 'lodash';

const scryptDKLen = 32;
const scryptR     = 8;

function encryptKey(key , auth, scryptN, scryptP){
    let authArray = new Buffer(auth);
    let salt = cryp.randomBytes(32);

    let derivedKey = scrypt.syncScrypt(authArray, salt, scryptN, scryptR, scryptP, scryptDKLen);

    let encryptKey = derivedKey.slice(0, 16);
    let keyBytes = key.xPrv;
    let iv = cryp.randomBytes(16);


    let cipherText = aesCTRXOR(encryptKey, keyBytes, iv);

    let kdfparams = {
        n:scryptN,
        r:scryptR,
        p:scryptP,
        dklen:scryptDKLen,
        salt:salt.toString('hex')
    };

    let mac = sha3_256(Buffer.concat([Buffer(derivedKey.slice(16, 32)), cipherText]));


    return {
        version: 1,
        xpub:key.xPub.toString('hex'),
        alias:key.alias,
        type: key.keyType,
        crypto: {
            ciphertext: cipherText.toString('hex'),
            cipherparams: {
                iv: iv.toString('hex')
            },
            cipher:  'aes-128-ctr',
            kdf:  'scrypt',
            kdfparams: kdfparams,
            mac: mac.toString('hex')
        }
    };
}


function aesCTRXOR(key, inText, iv) {
    let cipher = cryp.createCipheriv('aes-128-ctr', key, iv);

    var ciphertext = Buffer.from([
        ...cipher.update(Buffer.from(inText, 'hex')),
        ...cipher.final()]
    );


    return ciphertext;
}

function decryptKey(v3Keystore, password){
    if (!_.isString(password)) {
        throw new Error('No password given.');
    }

    let   k = (_.isObject(v3Keystore)) ? v3Keystore : JSON.parse(v3Keystore);
    const xprv = decrypt(k, password);
    const _xprv = new XPrv(xprv)
    const xpub = _xprv.XPub()

    return {
        xPrv:    xprv,
        xPub:    xpub,
        keyType: k.type,
        alias:   k.alias,
    };
}

function decrypt(json, password) {
    var derivedKey;
    var kdfparams;
    if (json.crypto.kdf === 'scrypt') {
        kdfparams = json.crypto.kdfparams;

        // FIXME: support progress reporting callback
        derivedKey = scrypt.syncScrypt(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);
    } else if (json.crypto.kdf === 'pbkdf2') {
        kdfparams = json.crypto.kdfparams;

        if (kdfparams.prf !== 'hmac-sha256') {
            throw new Error('Unsupported parameters to PBKDF2');
        }

        derivedKey = cryp.pbkdf2Sync(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.c, kdfparams.dklen, 'sha3256');
    } else {
        throw new Error('Unsupported key derivation scheme');
    }

    var ciphertext = Buffer.from(json.crypto.ciphertext, 'hex');

    var mac = sha3_256(Buffer.concat([Buffer(derivedKey.slice(16, 32)), ciphertext]));
    if (mac !== json.crypto.mac) {
        throw new Error('Key derivation failed - possibly wrong password');
    }

    var decipher = cryp.createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 16), Buffer.from(json.crypto.cipherparams.iv, 'hex'));
    var privateKey = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    return privateKey;
}


export{
    encryptKey,
    decryptKey
};
