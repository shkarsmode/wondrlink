import { Component, Input, Output, EventEmitter, Renderer2, ElementRef, HostListener, SimpleChange, SimpleChanges } from '@angular/core';
import { ICountryCodes } from '../../interfaces/ICountryCodes';
import { CountryCodesService } from '../../services/country-codes.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-country-codes',
  standalone: true,
  imports: [CommonModule],
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

    public sortedIndex: number = 0;

    constructor(
        private countryCodesService: CountryCodesService,
    ) {}

    ngOnInit(): void {
        this.getData();
        this.onCountryCodeChange();
        this.countryCodes = this.toSortedByCode(this.currentCountry.dial_code)
    }

    ngOnChanges(changes: SimpleChanges): void {
    
        if (changes['currentCountry'] && !changes['currentCountry'].firstChange) {
            // Handle the change in currentCountry here
            this.countryCodes = this.toSortedByCode(this.currentCountry.dial_code);
          }
    }

    private getData() {
        this.countryCodes = this.countryCodesService.getCountryCodes();
    }

    private toSortedByCode(code: string): ICountryCodes[] {
        const unTargetCountries = this.countryCodes.filter(country => !country.dial_code.startsWith(code));

        unTargetCountries.sort((a, b) => a.name.localeCompare(b.name))
        // Вибираємо елементи, які мають код
        const targetCountires = this.countryCodes.filter(country => country.dial_code.startsWith(code));

        targetCountires.sort((a, b) => {
            // Compare by dial_code length first
            const lengthComparison = a.dial_code.length - b.dial_code.length;
        
            // If lengths are equal, compare alphabetically by name
            return lengthComparison !== 0
              ? lengthComparison
              : a.name.localeCompare(b.name);
          });

          this.sortedIndex = targetCountires.length - 1;

        // Об'єднуємо фільтрований масив та масив з елементами, які мають код +1
        return targetCountires.concat(unTargetCountries );
    }

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





