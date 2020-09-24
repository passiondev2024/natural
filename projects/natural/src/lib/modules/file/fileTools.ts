export function acceptType(accept: string, type: string, name?: string): boolean {
    if (!accept) {
        return true;
    }

    const defs = accept.split(',');
    let regx: RegExp;
    let acceptRegString: string;

    for (let x = defs.length - 1; x >= 0; --x) {
        // Escapes dots in mimetype
        acceptRegString = defs[x];
        // trim
        acceptRegString = acceptRegString.replace(/(^\s+|\s+$)/g, '');
        // Escapes stars in mimetype
        acceptRegString = acceptRegString.replace(/\*/g, '.*');
        // let acceptReg = '^((' + acceptRegString
        // acceptReg = acceptReg.replace(/,/g,')|(') + '))$'

        // try by mime
        regx = new RegExp(acceptRegString, 'gi');
        if (type.search(regx) >= 0) {
            return true;
        }

        // try by ext
        if (acceptRegString.substring(0, 1) === '.') {
            acceptRegString = '\\' + acceptRegString; // .substring(1, acceptRegString.length-1)//remove dot at front
            regx = new RegExp(acceptRegString + '$', 'i');
            if ((name || type).search(regx) >= 0) {
                return true;
            }
        }
    }
    return false;
}

export interface InvalidFileItem {
    file: File;
    type: string;
}
