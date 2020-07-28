let createHmac = require('create-hmac');
let ED25519 =require('../ed25519');
let Curve25519 = new ED25519.Curve;

// If r is nil, crypto/rand.Reader is used.

function scalarmult_base (q){
    let base = Curve25519.point().base();
    let scalar = Curve25519.scalar().setBytes(new Uint8Array(q));
    let target = Curve25519.point().mul(scalar, base);

    return target.toString();
}

function XPrv(xprv) {
    if (!(this instanceof XPrv)) {
        return new XPrv();
    }
    this.xprv = xprv;
}


function newXPrv(r) {
    let entropy;
    if(!r){
        entropy = Buffer.alloc(64);
    }else{
        entropy = r.slice(0, 64);
    }
    return rootXPrv(entropy);
}

// rootXPrv takes a seed binary string and produces a new xprv.
function rootXPrv(seed){
    let h = createHmac('sha512', Buffer.from('Root', 'utf8'))
        .update(seed)
        .digest();

    const hL = h.slice(0, 32);
    const hR = h.slice(32);

    pruneRootScalar(hL);

    let xprv = new XPrv(Buffer.concat( [hL,hR]));

    return xprv;
}

exports.XPrv = XPrv;
exports.newXPrv = newXPrv;
exports.rootXPrv = rootXPrv;

// XPub derives an extended public key from a given xprv.
XPrv.prototype.XPub = function() {
    const xprv = this.xprv;
    const xpub = Buffer.concat([Buffer.from(scalarmult_base(xprv.slice(0, 32)),'hex'), xprv.slice(32, xprv.length)]);

    return xpub;
};

function pruneRootScalar(s) {
    s[0] &= 248;
    s[31] &= 31; // clear top 3 bits
    s[31] |= 64; // set second highest bit
}
