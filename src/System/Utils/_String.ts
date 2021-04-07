export default {
    toNormal: (str: string): string => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    },
    utf8Decode: (utf8String: string) : string => {
        // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
        const unicodeString = utf8String.replace(
            /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, // 3-byte chars
            function (c) { // (note parentheses for precedence)
                const cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f);
                return String.fromCharCode(cc);
            }
        ).replace(
            /[\u00c0-\u00df][\u0080-\u00bf]/g, // 2-byte chars
            function (c) { // (note parentheses for precedence)
                const cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
                return String.fromCharCode(cc);
            }
        );
        return unicodeString;
    }
};
