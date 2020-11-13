import {SignData} from './signTransaction';

function signMessage(message, password, keyJSON) {
    if (!(message) || !(password) || !(keyJSON) ){
        throw('Input args are empty', 'BTM3100');
    }

    let signData = SignData(keyJSON, null, Buffer.from(message, 'utf8'), password);

    let ret = {};
    ret.signature = (new Buffer(signData)).toString('hex')
    return ret;
}

export {
    signMessage
};