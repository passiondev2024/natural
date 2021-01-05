import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {FileModel, FileSelection, NaturalFileService} from '@ecodev/natural';
import {FileService} from './file.service';

interface JsonFile {
    name: string;
    type: string;
    size: number;
    lastModified: number;
}

interface JsonFileSelection {
    valid: JsonFile[];
    invalid: {
        error: string;
        file: JsonFile;
    }[];
}

function fileToJson(file: File): JsonFile {
    return {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
    };
}

function selectionToJson(selection: FileSelection): JsonFileSelection {
    return {
        valid: selection.valid.map(fileToJson),
        invalid: selection.invalid.map(item => {
            return {
                error: item.error,
                file: fileToJson(item.file),
            };
        }),
    };
}

@Component({
    selector: 'app-file',
    templateUrl: './file.component.html',
    styleUrls: ['./file.component.scss'],
})
export class FileComponent implements OnInit {
    public disabled = false;
    public fileOver: boolean | null = null;
    public fileOverJpg: boolean | null = null;
    public fileOverSelectable: boolean | null = null;
    public fileOverSelectableJpg: boolean | null = null;
    public fileOverMaxSize: boolean | null = null;
    public fileOverService: boolean | null = null;
    private subscription: Subscription | null = null;

    public model: FileModel | null = null;

    constructor(private readonly uploadService: NaturalFileService, public readonly fileService: FileService) {}

    public ngOnInit(): void {}

    public fileChange(file: File): void {
        console.log('fileChange', fileToJson(file));
    }

    public filesChange(selection: FileSelection): void {
        console.log('filesChange', selectionToJson(selection));
    }

    public subscribe(): void {
        if (this.subscription) {
            return;
        }

        this.subscription = this.uploadService.filesChanged.subscribe(selection =>
            console.log('service filesChanged', selectionToJson(selection)),
        );
    }

    public unsubscribe(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }

    public modelChange($event: FileModel): void {
        console.log({
            ...$event,
            file: $event.file ? fileToJson($event.file) : null,
        });
    }

    public setImage(): void {
        this.model = {
            __typename: 'Image',
            id: '123',
            mime: 'image/jpeg',
        };
    }

    public setImageWithSrc(): void {
        this.model = {
            id: '456',
            src: './assets/logo.svg',
        };
    }

    public setFile(): void {
        this.model = {
            __typename: 'File',
            id: '789',
            mime: 'application/pdf',
        };
    }

    public clear(): void {
        this.model = null;
    }
}
