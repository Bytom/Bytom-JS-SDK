import { hexEncode } from './hex.js';
import bech32 from 'bech32';

export function convertArguements(obj){
    const type = obj.type;
    const value = obj.raw_data.value;
    let convertValue;
    switch (type) {
    case 'data' :
        convertValue =convertData(value);
        break;
    case 'integer':
        convertValue = convertInteger(value);
        break;
    case 'string':
        convertValue = hexEncode(value);
        break;
    case 'boolean':
        convertValue = convertBoolean(value);
        break;
    case 'address':
        convertValue = convertAddress(value);
        break;
    default:
        throw 'Invalid data type.';
    }
    return { data: convertValue };
}

function convertBoolean(bool) {
    if(bool === true){
        return '01';
    }else if(bool === false){
        return '';
    }else {
        throw 'Invalid Boolean argument';
    }
}

function convertInteger(int){
    const hexInt =  Number(int).toString(16);
    if(hexInt.length % 2){
        return convertToLittleEnd('0'+hexInt);
    }else{
        return convertToLittleEnd(hexInt);
    }
}

function convertToLittleEnd(hex){
    return hex.match(/../g).reverse().join('');
}

function convertData(data){
    if(/^[-+]?[0-9A-Fa-f]+\.?[0-9A-Fa-f]*?$/i.test(data)){
        return data;
    }else{
        throw 'Invalid hex data';
    }
}

function convertAddress(address) {
    const addressPrefix = address.substring(0,2);
    const validAddressArray = ['tm', 'bm', 'sm'];
    if( !validAddressArray.includes(addressPrefix) ){
        throw 'bad address format';
    }

    const decodedWord = bech32.decode(address);
    let array = decodedWord.words;
    array.shift();

    const words = bech32.fromWords(array);

    if(words.length!==20 && words.length!==32){
        throw `invalid data length for witness , ${words.length}`;
    }

    const hex  = '00'+Number(words.length).toString(16)+(Buffer.from(words)).toString('hex');

    return hex;
}
