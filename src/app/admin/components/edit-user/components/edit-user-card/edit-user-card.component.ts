import { Component, Input, OnInit, forwardRef } from '@angular/core';
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
        }
    ],
})
export class EditUserCardComponent implements ControlValueAccessor, OnInit {
    @Input() public title: string;
    @Input() public isRequired: boolean = true;

    public value: string = '';

    public onChange: any = () => {};
    public onTouched: any = () => {};

    public ngOnInit() {}

    public writeValue(value: any): void {
        if (value !== undefined) {
            this.value = value;
        }
    }

    public registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    public onInputChange(event: any) {
        this.value = event.target.value;
        this.onChange(this.value);
        this.onTouched();
    }
}
