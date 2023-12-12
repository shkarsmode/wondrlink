import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-edit-user-card',
    templateUrl: './edit-user-card.component.html',
    styleUrls: ['./edit-user-card.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EditUserCardComponent),
            multi: true,
        },
    ],
})
export class EditUserCardComponent implements ControlValueAccessor {
    @Input() public title: string = 'Title';
    @Input() public isRequired: boolean = true;
    @Input() public isTextArea: boolean = false;

    public value: string = '';
    public onChange: any = () => {};
    public onTouched: any = () => {};

    public writeValue(value: any): void {
        if (value !== undefined) {
            this.value = value;
        }
    }

    public registerOnChange = (fn: any) => (this.onChange = fn);
    public registerOnTouched = (fn: any) => (this.onTouched = fn);

    public onInputChange(event: any) {
        this.value = event.target.value;
        this.onChange(this.value);
        this.onTouched();
    }
}
