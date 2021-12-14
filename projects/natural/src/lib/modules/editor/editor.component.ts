import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    Self,
    ViewChild,
} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {EditorView} from 'prosemirror-view';
import {EditorState, Transaction} from 'prosemirror-state';
// @ts-ignore
import {exampleSetup} from 'prosemirror-example-setup';
import {DOMParser, DOMSerializer} from 'prosemirror-model';
import {schema} from './schema';
import {DOCUMENT} from '@angular/common';

/**
 * Prosemirror component
 * Usage :
 * <natural-editor [(ngModel)]="htmlString"></natural-editor>
 */
// @dynamic
@Component({
    selector: 'natural-editor',
    template: ` <div #editor></div>`,
    styleUrls: ['./editor.component.scss'],
})
export class NaturalEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
    private view: EditorView | null = null;

    @ViewChild('editor', {read: ElementRef, static: true}) private editor!: ElementRef;

    @Output() public readonly contentChange = new EventEmitter<string>();

    /**
     * Interface with ControlValueAccessor
     * Notifies parent model / form controller
     */
    private onChange?: (value: string | null) => void;

    /**
     * HTML string
     */
    private content = '';

    constructor(
        @Optional() @Self() public readonly ngControl: NgControl,
        @Inject(DOCUMENT) private readonly document: Document,
    ) {
        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }
    }

    public ngOnInit(): void {
        const serializer = DOMSerializer.fromSchema(schema);
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

        const parser = DOMParser.fromSchema(schema);
        const doc = parser.parse(template.firstChild!);

        return EditorState.create({
            doc: doc,
            plugins: exampleSetup({schema}),
        });
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
}
