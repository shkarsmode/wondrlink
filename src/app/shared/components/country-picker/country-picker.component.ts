import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { countryPhonesData } from 'src/assets/data/country-phones.data';
import { ICountryPhone, ICountryPhones } from '../../interfaces/country-phone.interface';
import { COUNTRY_PHONE_DATA } from '../../tokens/country-phone-data.token';


@Component({
  selector: 'app-country-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './country-picker.component.html',
  styleUrl: './country-picker.component.scss',
  providers: [ {provide: COUNTRY_PHONE_DATA, useValue: countryPhonesData}]
})
export class CountryPickerComponent {

  @Output() public onCountryChange: EventEmitter<ICountryPhone> = new EventEmitter<ICountryPhone>();

  @ViewChild('countriesWrap') countriesWrap: ElementRef;
  @ViewChild('searchedCountriesWrap') searchedCountriesWrap: ElementRef;

  public searchValue: string = "";
  public searchedCountries: ICountryPhones = [];
  

  constructor(
      private renderer: Renderer2,
      @Inject(COUNTRY_PHONE_DATA) public countryCodes: ICountryPhones
  ){}

  ngOnInit(): void {
    this.sortCountriesBySuggested();
  }

  ngAfterViewInit(): void {
      this.renderer.listen(this.countriesWrap.nativeElement, 'click', (event: MouseEvent) => {
        this.handleCountryClick(event);
      })

      this.renderer.listen(this.searchedCountriesWrap.nativeElement, 'click', (event: MouseEvent) => {
        this.handleCountryClick(event);
      })
  }
 
  public get isSearchValue(): boolean {return !!this.searchValue;}
   
  public onSearch(): void {
      let country = this.searchValue.trim().toLowerCase();
      this.searchedCountries = this.countryCodes.filter(el => {
          return el.name.toLowerCase().startsWith(country);
      });   
  }

  public clearSearch(): void { 
      this.searchValue = ""; 
      this.searchedCountries = [];
  }

  private handleCountryClick(event: MouseEvent): void {
    
        const target = event.target as HTMLElement;
        const countryOption = target.closest('.country-option');
        let countryName = null;
        let country = null;

        if (countryOption) {
          countryName = countryOption.getAttribute('data-country-name');
        }
        
        if(countryName) {
          country = this.findCountryByName(countryName);
        }

        if(country) {
          this.onCountryChange.emit(country);
        }
  }


  public findCountryByName(name: string): ICountryPhone | null{
      return this.countryCodes.find(el => el.name == name) || null;
  }

  private sortCountriesBySuggested(): void {
    this.countryCodes = this.countryCodes.sort((a, b) => {
      if (a.suggested && !b.suggested) {
        return -1; // a is suggested, b is not
      } else if (!a.suggested && b.suggested) {
        return 1; // b is suggested, a is not
      } else {
        return 0; // both are suggested or both are not suggested
      }
    });
  }


}

