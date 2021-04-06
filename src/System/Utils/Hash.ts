export default {
    Encrypt: (text: string, salt: string) : string => {
        const CryptoJS = require('crypto-js');
        return CryptoJS.AES.encrypt(text, salt).toString();
    },

    Decrypt: (text: string, salt: string) : string => {
        const CryptoJS = require('crypto-js');
        const bytes = CryptoJS.AES.decrypt(text, salt);
        return bytes.toString(CryptoJS.enc.Utf8);
    },

    UID: () : string => {
        const firstPart = (Math.random() * 46656) | 0;
        const secondPart = (Math.random() * 46656) | 0;
        return ('000' + firstPart.toString(36)).slice(-3) + ('000' + secondPart.toString(36)).slice(-3);
    },

    GUID: () : string => {
        const { v1: uuid } = require('uuid');
        return uuid();
    }
};
