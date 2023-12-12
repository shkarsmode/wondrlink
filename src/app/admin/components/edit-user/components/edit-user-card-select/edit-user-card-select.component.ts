import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-edit-user-card-select',
    templateUrl: './edit-user-card-select.component.html',
    styleUrls: ['./edit-user-card-select.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EditUserCardSelectComponent),
            multi: true,
        }
    ],
})
export class EditUserCardSelectComponent implements ControlValueAccessor, OnInit {
    @Input() public title: string = 'Title';
    @Input() public isRequired: boolean = true;
    @Input() public iterableListToConvert: Array<string> | Object | any;

    public value: string = '';
    public iterableList: string[];
    public onChange: any = () => {};
    public onTouched: any = () => {};

    public ngOnInit(): void {
        this.iterableList = Object.values(this.iterableListToConvert);
    }

    public writeValue(value: any): void {
        if (value !== undefined) {
            this.value = value;
        }
    }

    public registerOnChange = (fn: any) => this.onChange = fn;
    public registerOnTouched = (fn: any) => this.onTouched = fn;
    
    public onSelectChange(value: string): void {
        this.value = value;
        this.onChange(this.value);
        this.onTouched();
    }
}