import { InjectionToken } from "@angular/core";
import { ICountryPhones } from "../interfaces/country-phone.interface";

const COUNTRY_PHONE_DATA = new InjectionToken<ICountryPhones>('countryPhonesData');