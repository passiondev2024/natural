import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NaturalFileService, InvalidFile} from '@ecodev/natural';

interface JsonFile {
    name: string;
    type: string;
    size: number;
    lastModified: number;
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
    public fileOver: boolean | null = null;
    public fileOverJpg: boolean | null = null;
    public fileOverSelectable: boolean | null = null;
    public fileOverSelectableJpg: boolean | null = null;
    public fileOverMaxSize: boolean | null = null;
    public fileOverService: boolean | null = null;
    private subscription: Subscription | null = null;

    constructor(private readonly uploadService: NaturalFileService) {}

    public ngOnInit(): void {}

    public fileChange(file: File): void {
        console.log('fileChange', fileToJson(file));
    }

    public filesChange(file: File[]): void {
        console.log('filesChange', file.map(fileToJson));
    }

    public invalidFilesChange(invalidFiles: InvalidFile[]): void {
        console.log(
            'invalidFilesChange',
            invalidFiles.map(item => {
                return {
                    error: item.error,
                    file: fileToJson(item.file),
                };
            }),
        );
    }

    public subscribe(): void {
        if (this.subscription) {
            return;
        }

        this.subscription = this.uploadService.filesChanged.subscribe(files =>
            console.log(
                'service filesChanged',
                files.map(file => fileToJson(file)),
            ),
        );
    }

    public unsubscribe(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}
