import {Component, OnInit} from '@angular/core';
import {InvalidFile} from '../../../projects/natural/src/lib/modules/file/abstract-file';

interface JsonFile {
    name: string;
    type: string;
    size: number;
    lastModified: number;
}

interface InvalidJsonFile {
    error: string;
    file: JsonFile;
}

function fileToJson(file: File): JsonFile {
    return {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
    };
}

@Component({
    selector: 'app-file',
    templateUrl: './file.component.html',
    styleUrls: ['./file.component.scss'],
})
export class FileComponent implements OnInit {
    public disabled = false;
    public file: JsonFile | null = null;
    public files: JsonFile[] = [];
    public invalidFiles: InvalidJsonFile[] = [];
    public fileOver: boolean | null = null;
    public fileOverJpg: boolean | null = null;
    public fileOverSelectable: boolean | null = null;
    public fileOverSelectableJpg: boolean | null = null;

    constructor() {}

    public ngOnInit(): void {}

    public fileChange(file: File): void {
        this.file = fileToJson(file);
    }

    public filesChange(file: File[]): void {
        this.files = file.map(fileToJson);
    }

    public invalidFilesChange(invalidFiles: InvalidFile[]): void {
        this.invalidFiles = invalidFiles.map(item => {
            return {
                error: item.error,
                file: fileToJson(item.file),
            };
        });
    }
}
