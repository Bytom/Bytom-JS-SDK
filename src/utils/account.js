import {decryptKey} from './key/keystore';

export function restoreFromKeyStore(v3Keystore, password){
    const key = decryptKey(v3Keystore, password)
    return key.xPub;

}
