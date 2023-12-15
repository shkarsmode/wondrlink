import { Injectable } from '@angular/core';
import { ICountryCodes } from '../interfaces/ICountryCodes';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountryCodesService {
    private countryCodesData: ICountryCodes[] = [];
    private dataUrl: string = 'assets/data';
// THIS countries are not supported by flagsapi.com
    // {
    // "name": "British Indian Ocean Territory",
    // "dial_code": "+246",
    // "code": "IO"
    // },
    // {
    //"name": "French Guiana",
    //"dial_code": "+594",
    //"code": "GF"
    // },
    // {
    // "name": "Guadeloupe",
    // "dial_code": "+590",
    // "code": "GP"
    // },
    // {
    //     "name": "Saint Barthelemy",
    //     "dial_code": "+590",
    //     "code": "BL"
    // },
    // {
    //     "name": "Saint Pierre and Miquelon",
    //     "dial_code": "+508",
    //     "code": "PM"
    // },
    // {
    //     "name": "Svalbard and Jan Mayen",
    //     "dial_code": "+47",
    //     "code": "SJ"
    // },

    constructor(private http: HttpClient) { }

    public setAllCountyCodes(){
        this.http
            .get<ICountryCodes[]>(this.dataUrl+'/country-codes.json')
            .subscribe((data: ICountryCodes[]) => this.countryCodesData = data)
    }

    public getCountryCodes(): ICountryCodes[] {
        return this.countryCodesData;
    }

}
