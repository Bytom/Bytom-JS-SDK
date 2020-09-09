import { decryptKey} from '../key/keystore';
import {XPrv} from '../key/chainkd';


function signTransaction(transaction, password, keyJSON)  {
    if (!(transaction) || !(password) || !(keyJSON) ){
        throw('Input args are empty');
    }
    let tx = transaction;
    let signRet = [];

    for(let k = 0; k<tx.signingInstructions.length; k++){
        const v = tx.signingInstructions[k];
        let path = [];
        for(let i = 0; i< v.derivationPath.length; i++ ){
            path[i] = Buffer.from(v.derivationPath[i],"hex");
        }
        for(let d of v.signData ){

            const h = Buffer.from(d, 'hex');
            const signData = SignData(keyJSON, path, h, password);
            if(signRet[k] == undefined) {
                signRet[k] = [];
            }
            signRet[k] = signRet[k].concat( (new Buffer(signData)).toString('hex'));
        }
    }
    let ret ={};
    ret.raw_transaction = tx.rawTransaction;
    ret.signatures = signRet;
    return ret;
}

function SignData(keyJSON, path, data, password){
    const key = decryptKey(keyJSON, password);
    let _xprv = new XPrv(key.xPrv);
    if (path && path.length > 0) {
        _xprv = _xprv.Derive(path);
    }
    return _xprv.Sign(data);
}

export {
    signTransaction,
    SignData
};
