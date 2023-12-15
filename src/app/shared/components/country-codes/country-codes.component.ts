import { Component, Input, Output, EventEmitter, Renderer2, ElementRef, HostListener } from '@angular/core';
import { ICountryCodes } from '../../interfaces/ICountryCodes';
import { CountryCodesService } from '../../services/country-codes.service';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-country-codes',
  standalone: true,
  imports: [],
  templateUrl: './country-codes.component.html',
  styleUrl: './country-codes.component.scss',
  animations: [
    trigger('fadeInOut', [
        transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
        ]),
        transition(':leave', [
        animate('300ms', style({ opacity: 0 })),
        ]),
    ]),
]
})
export class CountryCodesComponent {
    @Input() currentCountry: ICountryCodes = {
        "name": "United States",
        "dial_code": "+1",
        "code": "US"
    }
    @Output() countryCode = new EventEmitter<string>();
    public countryCodes: ICountryCodes[] = [];
    @Input() public isOpen: boolean = false;

    constructor(
        private countryCodesService: CountryCodesService,
        private renderer: Renderer2,
        private el: ElementRef
    ) {}

    ngOnInit(): void {
        this.getData();
        this.onCountryCodeChange();
    }

    private getData() {
        this.countryCodes = this.countryCodesService.getCountryCodes();
    }

    // private initCurrentCode() {
    //     this.currentCountry = this.countryCodes.find(el => el.dial_code === "+1")!;
    // }

    public selectCountry(event: MouseEvent): void {
        const selectedCountry = event.target as HTMLElement;

        const dataIndex = selectedCountry.getAttribute('data-select');
        if (dataIndex !== null) {
            this.currentCountry = this.countryCodes[+dataIndex];
            this.onCountryCodeChange();
            this.toggleDropdown();
        }
    }

    public toggleDropdown(): void {
        this.isOpen = !this.isOpen;
    }

    public toggleDropdown2(event: Event): void {
        this.isOpen = !this.isOpen;
        event.stopPropagation(); // Make sure this line is NOT present
    }

    private onCountryCodeChange(): void {
        this.countryCode.emit(this.currentCountry.dial_code);
    }


    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        if(!this.isOpen) return;
        const target = event.target as HTMLElement;

        const isCountryCodeItem = target.classList.contains('country-code__item');


        if (!isCountryCodeItem) {
            this.isOpen = false;
        }
    }

}





