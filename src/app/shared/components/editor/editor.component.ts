import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, forwardRef, Output, ViewChild } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorComponent implements ControlValueAccessor {
    @ViewChild('editorJs', { static: true }) 
    public editorElement: ElementRef;

    private editor: EditorJS;
    private onChange: (value: any) => void = () => {};

    private initialData = {
        blocks: [],
    };
    @Output() public onGetTextForSubHeader: EventEmitter<string> = new EventEmitter();

    private initEditorJs(): void {
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
                    this.onGetTextForSubHeader.emit(data.blocks[0].data.text);
                    const pureHtmlString =
                        this.getPureHtmlStringBasedOnEditorJsData(data);
                    this.onChange(pureHtmlString);
                });
            },
        });
    }

    public writeValue(value: any): void {
        this.initialData = this.convertHtmlToEditorJsData(value);
        this.initEditorJs();
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
        const blocks = Array.from(doc.body.children).map((el) => {
            let blockData: any = { type: '', data: {} };

            switch (el.nodeName.toLowerCase()) {
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    blockData.type = 'header';
                    blockData.data.text = el.innerHTML;
                    blockData.data.level = Number(el.nodeName[1]);
                    break;
                case 'p':
                    if (el.innerHTML === '<br>') return null;
                    blockData.type = 'paragraph';
                    blockData.data.text = el.innerHTML;
                    break;
                case 'ul':
                case 'ol':
                    blockData.type = 'list';
                    blockData.data.items = Array.from(el.children).map(
                        (li: any) => li.innerHTML
                    );
                    blockData.data.style =
                        el.nodeName.toLowerCase() === 'ul'
                            ? 'unordered'
                            : 'ordered';
                    break;
                case 'blockquote':
                    blockData.type = 'quote';
                    blockData.data.text = el.innerHTML;
                    break;
                case 'strong':
                    blockData.type = 'text';
                    blockData.data.text = el.innerHTML;
                    blockData.data.bold = true;
                    break;
                case 'em':
                    blockData.type = 'text';
                    blockData.data.text = el.innerHTML;
                    blockData.data.italic = true;
                    break;
                default:
                    blockData.type = 'paragraph';
                    blockData.data.text = el.innerHTML;
                    break;
            }

            return blockData;
        }).filter(block => !!block);

        return { blocks };
    }
}
