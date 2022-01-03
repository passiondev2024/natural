import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    Self,
    ViewChild,
} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {EditorView} from 'prosemirror-view';
import {EditorState, Plugin, Transaction} from 'prosemirror-state';
// @ts-ignore
import {exampleSetup} from 'prosemirror-example-setup';
import {DOMParser, DOMSerializer, Schema} from 'prosemirror-model';
import {advancedSchema, basicSchema} from './schema';
import {DOCUMENT} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {buildMenuItems, Key, MenuItems} from './menu';
import {ImagePlugin, ImageUploader} from './image';

/**
 * Prosemirror component
 *
 * Usage :
 *
 * ```html
 * <natural-editor [(ngModel)]="htmlString"></natural-editor>
 * ```
 */
// @dynamic
@Component({
    selector: 'natural-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class NaturalEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
    private view: EditorView | null = null;

    @ViewChild('editor', {read: ElementRef, static: true}) private editor!: ElementRef;

    @Output() public readonly contentChange = new EventEmitter<string>();

    /**
     * Callback to upload an image.
     *
     * If given it will enable advanced schema, including image and tables.
     * It must be given on initialization and cannot be changed later on.
     */
    @Input() public imageUploader: ImageUploader | null = null;

    private schema: Schema = basicSchema;

    /**
     * Interface with ControlValueAccessor
     * Notifies parent model / form controller
     */
    private onChange?: (value: string | null) => void;

    /**
     * HTML string
     */
    private content = '';

    public menu: MenuItems | null = null;

    constructor(
        @Optional() @Self() public readonly ngControl: NgControl,
        @Inject(DOCUMENT) private readonly document: Document,
        private readonly dialog: MatDialog,
        private readonly imagePlugin: ImagePlugin,
    ) {
        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }
    }

    public ngOnInit(): void {
        this.schema = this.imageUploader ? advancedSchema : basicSchema;
        this.menu = buildMenuItems(this.schema, this.dialog);
        const serializer = DOMSerializer.fromSchema(this.schema);
        const state = this.createState();

        this.view = new EditorView(this.editor.nativeElement, {
            state: state,
            dispatchTransaction: (transaction: Transaction) => {
                if (!this.view) {
                    return;
                }

                const newState = this.view.state.apply(transaction);
                this.view.updateState(newState);

                // Transform doc into HTML string
                const dom = serializer.serializeFragment(this.view.state.doc as any);
                const el = this.document.createElement('_');
                el.appendChild(dom);

                const newContent = el.innerHTML;
                if (this.content === newContent) {
                    return;
                }

                this.content = el.innerHTML;

                if (this.onChange) {
                    this.onChange(this.content);
                }
                this.contentChange.emit(this.content);
            },
        });
        this.update();
    }

    public writeValue(val: string | undefined): void {
        if (typeof val === 'string' && val !== this.content) {
            this.content = val;
        }

        if (this.view !== null) {
            const state = this.createState();
            this.view.updateState(state);
        }
    }

    private createState(): EditorState {
        const template = this.document.createElement('_');
        template.innerHTML = '<div>' + this.content + '</div>';
        if (!template.firstChild) {
            throw new Error('child of template element could not be created');
        }

        const parser = DOMParser.fromSchema(this.schema);
        const doc = parser.parse(template.firstChild);
        const self = this;

        return EditorState.create({
            doc: doc,
            plugins: [
                ...exampleSetup({schema: this.schema, menuBar: false}),
                this.imagePlugin.plugin,
                new Plugin({
                    view: () => self,
                }),
            ],
        });
    }

    /**
     * Called by Prosemirror whenever the editor state changes. So we update our menu states.
     */
    public update(): void {
        if (!this.view || !this.menu) {
            return;
        }

        for (const item of Object.values(this.menu)) {
            item.update(this.view, this.view.state);
        }
    }

    public registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: any): void {}

    public setDisabledState(isDisabled: boolean): void {
        // TODO disable editor ?
    }

    public ngOnDestroy(): void {
        if (this.view) {
            this.view.destroy();
            this.view = null;
        }
    }

    public run(event: Event, key: Key): void {
        if (!this.view || !this.menu) {
            return;
        }

        const item = this.menu[key];
        if (!item || item.disabled || !item.show) {
            return;
        }

        item.spec.run(this.view.state, this.view.dispatch, this.view, event);
        this.view.focus();
    }

    public upload(file: File): void {
        if (!this.view || !this.imageUploader) {
            return;
        }

        if (this.view.state.selection.$from.parent.inlineContent) {
            this.imagePlugin.startImageUpload(this.view, file, this.imageUploader, this.schema);
        }

        this.view.focus();
    }
}
