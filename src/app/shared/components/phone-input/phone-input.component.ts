import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    Inject,
    Output,
    ViewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR,
    ValidatorFn,
} from '@angular/forms';

import { catchError, debounceTime, Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import {
    CountryCode,
    isPossiblePhoneNumber,
    isValidPhoneNumber,
    parsePhoneNumber,
} from 'libphonenumber-js';
import { countryPhonesData } from 'src/assets/data/country-phones.data';
import {
    ICountryPhone,
    ICountryPhones,
} from '../../interfaces/country-phone.interface';
import { COUNTRY_PHONE_DATA } from '../../tokens/country-phone-data.token';
import { CountryPickerComponent } from '../country-picker/country-picker.component';

@Component({
    selector: 'app-phone-input',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CountryPickerComponent,
    ],
    templateUrl: './phone-input.component.html',
    styleUrl: './phone-input.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PhoneInputComponent),
            multi: true,
        },
        {
            provide: COUNTRY_PHONE_DATA,
            useValue: countryPhonesData,
        },
    ],
})
export class PhoneInputComponent implements ControlValueAccessor {
    @ViewChild('phoneWrap') phoneWrap: ElementRef;

    @HostListener('document:click', ['$event']) onClickOutside(
        event: MouseEvent
    ) {
        if (!this.phoneWrap.nativeElement.contains(event.target)) {
            this.isDropdown = false;
        }
    }

    @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();

    private onChange: any = () => {};
    private onTouched: any = () => {};

    public phoneInput: FormControl;

    public defaultCountry: ICountryPhone = {
        name: 'United States',
        dial_code: '+1',
        code: 'US',
        suggested: true,
        phoneLength: 10,
    };
    public currentCountry: ICountryPhone = this.defaultCountry;

    public isDropdown: boolean = false;

    constructor(
        private http: HttpClient,
        @Inject(COUNTRY_PHONE_DATA) public countriesPhoneData: ICountryPhones
    ) {}

    public ngOnInit(): void {
        this.initCountry();
        this.phoneInput = new FormControl('', [
            this.validate(),
            this.checkLength(),
        ]);
        this.phoneInput.statusChanges
            .subscribe((el) => this.emitValidity());
    }

    ngAfterViewInit(): void {
        this.listenPhoneInput();
        this.emitValidity();
    }

    public initCountry(): void {
        let code = localStorage.getItem('visitorCountry');

        if (code) {
            this.currentCountry = this.getCountryPhoneInfo(code);
        } else {
            this.getVisitorCountry().subscribe((res) => {
                this.currentCountry = this.getCountryPhoneInfo(res.country);
                localStorage.setItem('visitorCountry', res.country);
            });
        }
    }

    public getVisitorCountry(): Observable<{ ip: string; country: string }> {
        return this.http
            .get<{ ip: string; country: string }>('https://api.country.is')
            .pipe(
                catchError(() =>
                    this.http.get<{ ip: string; country: string }>(
                        'https://ipapi.co/json/'
                    )
                )
            );
    }

    public getCountryPhoneInfo(code: string): ICountryPhone {
        return (
            this.countriesPhoneData.find((country) => country.code === code) ||
            this.defaultCountry
        );
    }

    //============
    public writeValue(value: string): void {
        // if (!value) return;
        // this.handlePhoneInput(value);
        this.phoneInput.setValue(value, { emitEvent: false });
    }

    public registerOnChange = (fn: any) => (this.onChange = fn);
    public registerOnTouched = (fn: any) => (this.onTouched = fn);

    public onCountryChange(newCountry: ICountryPhone): void {
        this.currentCountry = newCountry;
        this.onChange(this.getPhone); //!!!!
        this.onTouched();
        this.isDropdown = false;
        this.phoneInput.updateValueAndValidity();
    }

    private listenPhoneInput(): void {
        this.phoneInput?.valueChanges
            .pipe(debounceTime(700))
            .subscribe((value) => {
                // this.startVerificationAndValidationProcess();
                this.handlePhoneInput(value);
                this.onChange(this.getPhone); //!!!!
                this.onTouched();
                this.emitValidity();
            });
    }

    private handlePhoneInput(inputValue: string): void {
        // const formattedPhoneInput = this.formatPhoneInput(inputValue);
        if (!inputValue.trim()) {
            this.valid.emit(false);
            return;
        }

        const fullNumber = this.getFullNumber(
            this.currentCountry.dial_code,
            this.cleanPhoneInput(inputValue)
        );

        let phoneNumber;

        phoneNumber = parsePhoneNumber(
            fullNumber,
            this.currentCountry.code as CountryCode
        );

        phoneNumber = parsePhoneNumber(
            fullNumber,
            this.currentCountry.code as CountryCode
        );

        // const formattedPhoneInput = phoneNumber.nationalNumber
        //     .replace(phoneNumber.countryCallingCode, '');

        const formattedPhoneInput = phoneNumber
            .formatInternational()
            .replace(this.currentCountry.dial_code, '');

        this.writeValue(formattedPhoneInput);

        this.phoneInput.patchValue(formattedPhoneInput, {
            emitEvent: false,
        });
    }

    // private formatPhoneInput(inputValue: string): string {
    //     if (!inputValue) return '';
    //     let cleanedInput = this.cleanPhoneInput(inputValue);

    //     // Add spaces every three characters
    //     const formattedInput = this.addCaratEveryThreeCharacters(cleanedInput);
    //     return formattedInput;
    // }

    private cleanPhoneInput(inputValue: string): string {
        // Remove any character that is not allowed in a phone number
        return inputValue.replace(/[^\d]/g, '');
    }

    // add space every 3 characker
    // private addCaratEveryThreeCharacters(inputValue: string): string {

    //   if (inputValue.length < 4) return inputValue;
    //   // Add spaces every three characters
    //   const groups = inputValue.match(/.{1,3}/g);
    //   const formattedValue = groups?.reduce((acc, group, index) => {
    //       // Add hyphen between groups except for the last one
    //       const separator = index < 2 ? '-' : '';
    //       return acc + group + separator;
    //   }, '');

    //   return formattedValue || '';

    // }

    public get getPhone(): string {
        let phone = this.phoneInput?.value;
        return this.currentCountry.dial_code + phone.split('-').join('');
    }

    private getFullNumber(dialCode: string, number: string): string {
        return dialCode + number;
    }

    public onInputChange(): void {
        // this.processVerificationAndValidation();
    }

    public get value(): string {
        return this.phoneInput.value;
    }

    public checkLength(): ValidatorFn {
        return (control: AbstractControl) => {
            let phone = control.value as string;

            let countryData = Object.assign({}, this.currentCountry); // Отримання даних країни
            if (!phone || !countryData) {
                // Якщо номер телефону або дані країни відсутні, повертаємо null (валідація не потрібна)
                return null;
            }

            phone = this.cleanPhoneInput(phone);

            const phoneLength = countryData.phoneLength;
            if (typeof phoneLength === 'number') {
                // Якщо вказано конкретну довжину номера
                return phone.length === phoneLength || 
                    phone.length === phoneLength - 1 ||
                    phone.length === phoneLength + 1
                    ? null
                    : { invalidLength: true };
            } else if (Array.isArray(phoneLength)) {
                // Якщо вказано діапазон довжин номера
                const min = Math.min(...phoneLength);
                const max = Math.max(...phoneLength);
                return phone.length >= min && phone.length <= max
                    ? null
                    : { invalidLength: true };
            } else if (countryData.min && countryData.max) {
                // Якщо вказано мінімальну та максимальну довжину номера
                return phone.length >= countryData.min &&
                    phone.length <= countryData.max
                    ? null
                    : { invalidLength: true };
            } else {
                // Якщо відсутня інформація про довжину номера, повертаємо помилку
                return null;
            }
        };
    }

    public validate(): ValidatorFn {
        return (control: AbstractControl) => {
            if (!control.value && !control.touched && !control.dirty) return null;

            let cleanedNumber = this.cleanPhoneInput(control.value);
            // let number = parsePhoneNumber(cleanedNumber, this.currentCountry.code as CountryCode) ;

            let isValid = isValidPhoneNumber(
                cleanedNumber,
                this.currentCountry.code as CountryCode
            );
            let isPossible = isPossiblePhoneNumber(
                cleanedNumber,
                this.currentCountry.code as CountryCode
            );

            // if (!isPossible) return { impossible: true };
            if (!isPossible) return { invalid: true };
            if (!isValid) return { invalid: true };

            return null;
        };
    }

    public isFocus: boolean = false;

    public onFocus(): void {
        this.isFocus = true;
    }

    public onBlur(): void {
        this.isFocus = false;
    }

    emitValidity(): void {
        // if(this.isVerification) { this.valid.emit(false); return; }
        if (this.phoneInput.errors) {
            this.valid.emit(false);
            return;
        }
        // if(!this.isValid) { this.valid.emit(false); return; }
        this.valid.emit(true);
    }
}
