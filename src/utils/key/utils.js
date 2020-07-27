import {newXPrv} from './chainkd';

function newXKeys(r) {
    let xprv = newXPrv(r);

    return {xprv, xpub: xprv.XPub()};
}

export{
    newXKeys
};


// function xPubKeys(xpubs)  {
//   res := make([]ed25519.PublicKey, 0, len(xpubs))
//   for _, xpub := range xpubs {
//     res = append(res, xpub.PublicKey())
//   }
//   return res
// }
//
// function deriveXPubs(xpubs []XPub, path [][]byte)  {
//   res := make([]XPub, 0, len(xpubs))
//   for _, xpub := range xpubs {
//     d := xpub.Derive(path)
//     res = append(res, d)
//   }
//   return res
// }