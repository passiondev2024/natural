export function acceptType(accept: string, type: string, filename: string): boolean {
    if (!accept.trim()) {
        return true;
    }

    type = type.toLowerCase();
    filename = filename.toLowerCase();

    return accept.split(',').some(mimeOrExtension => {
        mimeOrExtension = mimeOrExtension.trim().toLowerCase();
        if (mimeOrExtension.startsWith('.')) {
            return filename.endsWith(mimeOrExtension);
        } else {
            // Transform `*` into `.*`
            const pattern = mimeOrExtension.replace(/\*/g, '.*');

            return type.match(pattern);
        }
    });
}

export function isFileInput(elm: HTMLElement): elm is HTMLInputElement {
    const type = elm.getAttribute('type');

    return elm.tagName.toLowerCase() === 'input' && !!type && type.toLowerCase() === 'file';
}

let initialTouchStartY = 0;
let initialTouchStartX = 0;

export function detectSwipe(event: Event | TouchEvent): boolean {
    const touches = 'changedTouches' in event ? event.changedTouches : null;
    if (!touches) {
        return false;
    }

    if (event.type === 'touchstart') {
        initialTouchStartX = touches[0].clientX;
        initialTouchStartY = touches[0].clientY;

        return true; // don't block event default
    } else {
        // prevent scroll from triggering event
        if (event.type === 'touchend') {
            const currentX = touches[0].clientX;
            const currentY = touches[0].clientY;
            if (Math.abs(currentX - initialTouchStartX) > 20 || Math.abs(currentY - initialTouchStartY) > 20) {
                event.stopPropagation();
                if (event.cancelable) {
                    event.preventDefault();
                }

                return false;
            }
        }

        return true;
    }
}

export function createInvisibleFileInputWrap(document: Document): HTMLLabelElement {
    const fileElem = createFileInput(document);
    const label = document.createElement('label');
    label.innerHTML = 'upload';
    label.style.visibility = 'hidden';
    label.style.position = 'absolute';
    label.style.overflow = 'hidden';
    label.style.width = '0px';
    label.style.height = '0px';
    label.style.border = 'none';
    label.style.margin = '0px';
    label.style.padding = '0px';
    label.setAttribute('tabindex', '-1');

    label.appendChild(fileElem);

    return label;
}

function createFileInput(document: Document): HTMLInputElement {
    const fileElem = document.createElement('input');
    fileElem.type = 'file';

    return fileElem;
}

export function stopEvent(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
}

export function fileListToArray(fileList: FileList): File[] {
    const result: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);
        if (file) {
            result.push(file);
        }
    }

    return result;
}

function dataTransferItemListToArray(items: DataTransferItemList): File[] {
    const result: File[] = [];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < items.length; i++) {
        const file = items[i].getAsFile();
        if (file) {
            result.push(file);
        }
    }

    return result;
}

export function eventToFiles(event: Event | DragEvent): File[] {
    const transfer = 'dataTransfer' in event ? event.dataTransfer : null;
    if (transfer?.files?.length) {
        return fileListToArray(transfer.files);
    }

    if (transfer) {
        return dataTransferItemListToArray(transfer.items);
    }

    return [];
}
