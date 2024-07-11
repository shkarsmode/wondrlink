import { IGeoLocation } from "./geo-location.interface";

export interface IGeoAutocompleteResponse {
    readonly results: IGeoLocation[];
    readonly query: {
        readonly parsed: Object;
        readonly text: string;
    };
}
