export interface IGeoLocation {
    readonly datasource: {
        readonly sourcename: string;
        readonly attribution: string;
        readonly license: string;
        readonly url: string;
    };
    readonly country: string;
    readonly country_code: string;
    readonly city: string;
    readonly lon: number;
    readonly lat: number;
    readonly formatted: string;
    readonly address_line1: string;
    readonly address_line2: string;
    readonly category: string;
    readonly timezone: {
        readonly name: string;
        readonly offset_STD: string;
        readonly offset_STD_seconds: number;
        readonly offset_DST: string;
        readonly offset_DST_seconds: number;
        readonly abbreviation_STD: string;
        readonly abbreviation_DST: string;
    };
    readonly plus_code: string;
    readonly plus_code_short: string;
    readonly result_type: string;
    readonly rank: {
        readonly importance: number;
        readonly confidence: number;
        readonly confidence_city_level: number;
        readonly match_type: string;
        readonly place_id: string;
    };
}
