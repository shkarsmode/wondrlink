import { InjectionToken } from "@angular/core";
import { ICountryPhones } from "../interfaces/country-phone.interface";

export const COUNTRY_PHONE_DATA = new InjectionToken<ICountryPhones>('countryPhonesData');