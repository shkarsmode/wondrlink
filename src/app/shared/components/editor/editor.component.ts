import { Component, ElementRef, forwardRef, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Underline from '@editorjs/underline';
import edjsHTML from 'editorjs-html';


@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [],
    templateUrl: './editor.component.html',
    styleUrl: './editor.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EditorComponent),
            multi: true,
        },
    ],
})
export class EditorComponent implements OnInit, ControlValueAccessor {
    @ViewChild('editorJs', { static: true }) public editorElement: ElementRef;
    private editor: EditorJS;
    private onChange: (value: any) => void = () => {};

    private initialData = {
        blocks: [],
    };

    public ngOnInit() {
        this.editor = new EditorJS({
            holder: this.editorElement.nativeElement,
            data: this.initialData,
            placeholder: 'Input some text...',
            tools: {
                header: {
                    // @ts-ignore
                    class: Header,
                    inlineToolbar: true,
                },
                paragraph: {
                    // @ts-ignore
                    class: Paragraph,
                    inlineToolbar: true,
                },
                list: {
                    // @ts-ignore
                    class: List,
                    inlineToolbar: true,
                },
                underline: Underline,
                quote: Quote,
            },
            onChange: () => {
                this.editor.save().then((data) => {
                    const pureHtmlString =
                        this.getPureHtmlStringBasedOnEditorJsData(data);
                    this.onChange(pureHtmlString);
                });
            },
        });
    }

    public writeValue(value: any): void {
        console.log('writeValue 0', value);
        if (!value) return;

        console.log('writeValue 1', value);

        const updatedEditorJsData = this.convertHtmlToEditorJsData(value);
        console.log('writeValue 2', updatedEditorJsData);
        if (updatedEditorJsData) {
            console.log(this.editor);
            this.editor.blocks.render(updatedEditorJsData);
        }
    }

    public registerOnChange(fn: (value: any) => void): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: () => void): void {}

    private getPureHtmlStringBasedOnEditorJsData(data: OutputData): string {
        const edjsParser = edjsHTML();
        const html = edjsParser.parse(data);
        return html;
    }

    private convertHtmlToEditorJsData(html: string): { blocks: any } {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const blocks = Array.from(doc.body.children).map((el) => ({
            type: 'paragraph',
            data: { text: el.innerHTML },
        }));
        return { blocks };
    }
}
