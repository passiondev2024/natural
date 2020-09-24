export function getWindow(): any {
    return window;
}

export function acceptType(accept: string, type: string, name?: string): boolean {
    if (!accept) {
        return true;
    }

    const defs = accept.split(',');
    let regx: RegExp;
    let acceptRegString: string;

    for (let x = defs.length - 1; x >= 0; --x) {
        //Escapes dots in mimetype
        acceptRegString = defs[x];
        //trim
        acceptRegString = acceptRegString.replace(/(^\s+|\s+$)/g, '');
        //Escapes stars in mimetype
        acceptRegString = acceptRegString.replace(/\*/g, '.*');
        //let acceptReg = '^((' + acceptRegString
        //acceptReg = acceptReg.replace(/,/g,')|(') + '))$'

        //try by mime
        regx = new RegExp(acceptRegString, 'gi');
        if (type.search(regx) >= 0) {
            return true;
        }

        //try by ext
        if (acceptRegString.substring(0, 1) == '.') {
            acceptRegString = '\\' + acceptRegString; //.substring(1, acceptRegString.length-1)//remove dot at front
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

/** converts file-input file into base64 dataUri */
export function dataUrl(file: any, disallowObjectUrl?: any): Promise<string> {
    if (!file) {
        return Promise.resolve(file);
    }

    if ((disallowObjectUrl && file.$ngfDataUrl != null) || (!disallowObjectUrl && file.$ngfBlobUrl != null)) {
        return Promise.resolve(disallowObjectUrl ? file.$ngfDataUrl : file.$ngfBlobUrl);
    }

    const p = disallowObjectUrl ? file.$$ngfDataUrlPromise : file.$$ngfBlobUrlPromise;
    if (p) {
        return p;
    }

    const win = getWindow();
    let deferred: Promise<string>;
    if (
        win.FileReader &&
        file &&
        (!win.FileAPI || navigator.userAgent.indexOf('MSIE 8') === -1 || file.size < 20000) &&
        (!win.FileAPI || navigator.userAgent.indexOf('MSIE 9') === -1 || file.size < 4000000)
    ) {
        //prefer URL.createObjectURL for handling refrences to files of all sizes
        //since it doesn´t build a large string in memory
        const URL = win.URL || win.webkitURL;
        if (FileReader) {
            deferred = new Promise((res, rej) => {
                const fileReader = new FileReader();
                fileReader.onload = function (event: any) {
                    file.$ngfDataUrl = event.target.result;
                    delete file.$ngfDataUrl;
                    res(event.target.result);
                };
                fileReader.onerror = function (e) {
                    file.$ngfDataUrl = '';
                    rej(e);
                };
                fileReader.readAsDataURL(file);
            });
        } else {
            const url: any;
            try {
                url = URL.createObjectURL(file);
            } catch (e) {
                return Promise.reject(e);
            }

            deferred = Promise.resolve(url);
            file.$ngfBlobUrl = url;
        }
    } else {
        file[disallowObjectUrl ? '$ngfDataUrl' : '$ngfBlobUrl'] = '';
        return Promise.reject(
            new Error('Browser does not support window.FileReader, window.FileReader, or window.FileAPI'),
        );
    }

    if (disallowObjectUrl) {
        p = file.$$ngfDataUrlPromise = deferred;
    } else {
        p = file.$$ngfBlobUrlPromise = deferred;
    }

    p = p.then((x: any) => {
        delete file[disallowObjectUrl ? '$$ngfDataUrlPromise' : '$$ngfBlobUrlPromise'];
        return x;
    });

    return p;
}
