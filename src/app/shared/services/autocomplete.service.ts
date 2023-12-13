import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IGeoAutocompleteResponse } from '../interfaces/geo/geo-autocomplete-response.interface';
import { IGeoLocation } from '../interfaces/geo/geo-location.interface';
import { GEO_API_KEY, GEO_PATH_API } from './variables';

@Injectable({
    providedIn: 'root',
})
export class AutocompleteService {
    private geoPathApi: string = '/';
    private geoApiKey: string;

    constructor(
        private http: HttpClient,
        @Inject(GEO_PATH_API) geoPathApi: string,
        @Inject(GEO_API_KEY) geoApiKey: string
    ) {
        if (geoPathApi) this.geoPathApi = geoPathApi;
        if (geoApiKey) this.geoApiKey = geoApiKey;
    }

    public getLocationAutocomplete(
        text: string,
        limit: number = 5,
        lang: string = 'en',
        type: string = 'city',
        format: string = 'json'
    ): Observable<IGeoLocation[]> {
        const params = new HttpParams({
            fromObject: {
                text,
                limit: limit.toString(),
                lang,
                type,
                format,
                apiKey: this.geoApiKey,
            },
        });

        return this.http
            .get<IGeoAutocompleteResponse>(this.geoPathApi, { params })
            .pipe(map((response) => response.results));
    }
}
