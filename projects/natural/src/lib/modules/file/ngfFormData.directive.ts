import {IterableDiffer, IterableDiffers, Directive, EventEmitter, Output, Input} from '@angular/core';

@Directive({selector: 'ngfFormData'})
export class ngfFormData {
    @Input() files!: File[];
    @Input() postName: string = 'file';
    @Input() fileName!: string; //force file name

    @Input() FormData: FormData = new FormData();
    @Output() FormDataChange: EventEmitter<FormData> = new EventEmitter();

    differ: IterableDiffer<{}>;

    constructor(IterableDiffers: IterableDiffers) {
        this.differ = IterableDiffers.find([]).create();
    }

    ngDoCheck() {
        var changes = this.differ.diff(this.files);

        if (changes) {
            setTimeout(() => this.buildFormData(), 0);
        }
    }

    buildFormData() {
        const isArray = typeof this.files === 'object' && this.files.constructor === Array;

        if (isArray) {
            this.FormData = new FormData();
            const files = this.files || [];
            files.forEach(file => this.FormData.append(this.postName, file, this.fileName || file.name));
            this.FormDataChange.emit(this.FormData);
        } else {
            delete this.FormData;
        }
    }
}
