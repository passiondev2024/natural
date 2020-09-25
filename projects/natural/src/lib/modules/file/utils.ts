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

export function isFileInput(elm: any): boolean {
    const ty = elm.getAttribute('type');
    return elm.tagName.toLowerCase() === 'input' && ty && ty.toLowerCase() === 'file';
}

let initialTouchStartY = 0;
let initialTouchStartX = 0;

export function detectSwipe(evt: any): boolean {
    const touches = evt.changedTouches || (evt.originalEvent && evt.originalEvent.changedTouches);
    if (touches) {
        if (evt.type === 'touchstart') {
            initialTouchStartX = touches[0].clientX;
            initialTouchStartY = touches[0].clientY;

            return true; // don't block event default
        } else {
            // prevent scroll from triggering event
            if (evt.type === 'touchend') {
                const currentX = touches[0].clientX;
                const currentY = touches[0].clientY;
                if (Math.abs(currentX - initialTouchStartX) > 20 || Math.abs(currentY - initialTouchStartY) > 20) {
                    evt.stopPropagation();
                    if (evt.cancelable) {
                        evt.preventDefault();
                    }

                    return false;
                }
            }

            return true;
        }
    }

    return false;
}

export function createInvisibleFileInputWrap(): HTMLLabelElement {
    const fileElem = createFileInput();
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

function createFileInput(): HTMLInputElement {
    const fileElem = document.createElement('input');
    fileElem.type = 'file';

    return fileElem;
}
