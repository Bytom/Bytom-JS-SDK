let createHmac = require('create-hmac');
let ED25519 =require('../ed25519');
let Curve25519 = new ED25519.Curve;
const nacl = require('../nacl');
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

// Clears lowest 3 bits and highest 23 bits of `f`.
function pruneIntermediateScalar(f) {
    f[0] &= 248; // clear bottom 3 bits
    f[29] &= 1;  // clear 7 high bits
    f[30] = 0;   // clear 8 bits
    f[31] = 0;   // clear 8 bits
}

XPrv.prototype.Derive = function(path) {
    let res = this;
    for( let p of path ){
        res = res.Child(p, false);
    }
    return res;
};


XPrv.prototype.Child = function(sel , hardened ) {
    if (hardened) {
        return this.hardenedChild(sel);
    }
    return this.nonhardenedChild(sel);
};


XPrv.prototype.hardenedChild = function(sel)  {
    const r = this.xprv.slice(32);
    const l = this.xprv.slice(0, 32);
    let h = createHmac('sha512', r)
        .update(Buffer.from('H', 'utf8'))
        .update(l)
        .update(sel)
        .digest();

    const hL = h.slice(0, 32);
    const hR = h.slice(32);

    pruneRootScalar(hL);

    return new XPrv( Buffer.concat( [hL,hR]) );
};

XPrv.prototype.nonhardenedChild = function(sel){
    const xpub = this.XPub();

    const r = xpub.slice(32);
    const l = xpub.slice(0, 32);
    let h = createHmac('sha512', r)
        .update(Buffer.from('N', 'utf8'))
        .update(l)
        .update(sel)
        .digest();


    const hL = h.slice(0, 32);
    const hR = h.slice(32);

    pruneIntermediateScalar(hL);

    let res = Buffer.concat( [hL,hR]);

    let sum = 0;

    sum =  this.xprv[0] +  res[0] + (sum >> 8);
    res[0] = sum & 0xff;
    sum =  this.xprv[1] +  res[1] + (sum >> 8);
    res[1] = sum & 0xff;
    sum =  this.xprv[2] +  res[2] + (sum >> 8);
    res[2] = sum & 0xff;
    sum =  this.xprv[3] +  res[3] + (sum >> 8);
    res[3] = sum & 0xff;
    sum =  this.xprv[4] +  res[4] + (sum >> 8);
    res[4] = sum & 0xff;
    sum =  this.xprv[5] +  res[5] + (sum >> 8);
    res[5] = sum & 0xff;
    sum =  this.xprv[6] +  res[6] + (sum >> 8);
    res[6] = sum & 0xff;
    sum =  this.xprv[7] +  res[7] + (sum >> 8);
    res[7] = sum & 0xff;
    sum =  this.xprv[8] +  res[8] + (sum >> 8);
    res[8] = sum & 0xff;
    sum =  this.xprv[9] +  res[9] + (sum >> 8);
    res[9] = sum & 0xff;
    sum =  this.xprv[10] +  res[10] + (sum >> 8);
    res[10] = sum & 0xff;
    sum =  this.xprv[11] +  res[11] + (sum >> 8);
    res[11] = sum & 0xff;
    sum =  this.xprv[12] +  res[12] + (sum >> 8);
    res[12] = sum & 0xff;
    sum =  this.xprv[13] +  res[13] + (sum >> 8);
    res[13] = sum & 0xff;
    sum =  this.xprv[14] +  res[14] + (sum >> 8);
    res[14] = sum & 0xff;
    sum =  this.xprv[15] +  res[15] + (sum >> 8);
    res[15] = sum & 0xff;
    sum =  this.xprv[16] +  res[16] + (sum >> 8);
    res[16] = sum & 0xff;
    sum =  this.xprv[17] +  res[17] + (sum >> 8);
    res[17] = sum & 0xff;
    sum =  this.xprv[18] +  res[18] + (sum >> 8);
    res[18] = sum & 0xff;
    sum =  this.xprv[19] +  res[19] + (sum >> 8);
    res[19] = sum & 0xff;
    sum =  this.xprv[20] +  res[20] + (sum >> 8);
    res[20] = sum & 0xff;
    sum =  this.xprv[21] +  res[21] + (sum >> 8);
    res[21] = sum & 0xff;
    sum =  this.xprv[22] +  res[22] + (sum >> 8);
    res[22] = sum & 0xff;
    sum =  this.xprv[23] +  res[23] + (sum >> 8);
    res[23] = sum & 0xff;
    sum =  this.xprv[24] +  res[24] + (sum >> 8);
    res[24] = sum & 0xff;
    sum =  this.xprv[25] +  res[25] + (sum >> 8);
    res[25] = sum & 0xff;
    sum =  this.xprv[26] +  res[26] + (sum >> 8);
    res[26] = sum & 0xff;
    sum =  this.xprv[27] +  res[27] + (sum >> 8);
    res[27] = sum & 0xff;
    sum =  this.xprv[28] +  res[28] + (sum >> 8);
    res[28] = sum & 0xff;
    sum =  this.xprv[29] +  res[29] + (sum >> 8);
    res[29] = sum & 0xff;
    sum =  this.xprv[30] +  res[30] + (sum >> 8);
    res[30] = sum & 0xff;
    sum =  this.xprv[31] +  res[31] + (sum >> 8);
    res[31] = sum & 0xff;

    if ((sum >> 8) != 0) {
        throw('sum does not fit in 256-bit int');
    }
    return new XPrv(res);
};

XPrv.prototype.Sign = function(msg){
    const expKey = this.ExpandedPrivateKey()

    const publicKey = Buffer.from(scalarmult_base(expKey.slice(0, 32)),'hex');
    return nacl.innerSign(msg, expKey, publicKey);
};

XPrv.prototype.ExpandedPrivateKey = function() {
    let h = createHmac('sha512', Buffer.from('Expand', 'utf8'))
        .update(this.xprv)
        .digest();
    const l = this.xprv.slice(0, 32);
    const r = h.slice(32);

    return  Buffer.concat( [l,r]);
};
