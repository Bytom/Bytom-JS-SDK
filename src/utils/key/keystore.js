let cryp = require('crypto-browserify');
let scrypt = require('scrypt-js');

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

    let mac = crypto.createHash('sha256').update(Buffer.from([...derivedKey.slice(16, 32), ...cipherText])).digest();

    return {
        version: 1,
        xpub:key.xPub,
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

exports.encryptKey = encryptKey;

function aesCTRXOR(key, inText, iv) {
    let cipher = cryp.createCipheriv('aes-128-ctr', key, iv);

    var ciphertext = Buffer.from([
        ...cipher.update(Buffer.from(inText, 'hex')),
        ...cipher.final()]
    );


    return ciphertext;
}
