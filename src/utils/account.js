var scrypt = require('scrypt-js');
var cryp = require('crypto-browserify');
var sha3_256 = require('js-sha3').sha3_256;
var _ = require('lodash')
var ED25519 =require('./ed25519');
var Curve25519 = new ED25519.Curve;

function decrypt(v3Keystore, password) {
    /* jshint maxcomplexity: 10 */

    if (!_.isString(password)) {
        throw new Error('No password given.');
    }

    var json = (_.isObject(v3Keystore)) ? v3Keystore : JSON.parse(v3Keystore);
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
};

function scalarmult_base (q){
    var base = Curve25519.point().base();
    var scalar = Curve25519.scalar().setBytes(new Uint8Array(q));
    var target = Curve25519.point().mul(scalar, base);

    return target.toString();
}

export function restoreFromKeyStore(v3Keystore, password){
    const privatekey = decrypt(v3Keystore, password);
    const publickey = scalarmult_base(privatekey.slice(0, privatekey.length/2)) + privatekey.slice(privatekey.length/2, privatekey.length).toString('hex')

    return publickey;
}
