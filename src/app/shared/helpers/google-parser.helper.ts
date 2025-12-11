// Minimal, senior-friendly helpers to extract administrative parts from Google Place
// @ts-ignore
type GAddressComponent = google.maps.GeocoderAddressComponent;

export interface ParsedAdministrativeAddress {
    city?: string;                // locality or postal_town or admin2 or admin3
    district?: string;            // administrative_area_level_2 (district/county)
    adminLevel3?: string;         // administrative_area_level_3
    sublocality?: string;         // sublocality_level_1 (borough/zone)
    state?: string;               // administrative_area_level_1 (state/province/region)
    country?: string;             // country long_name
    countryCode?: string;         // country short_name (ISO-3166-1 alpha-2)
    postalCode?: string;          // postal_code
}

/** Returns long_name or short_name for a given component type */
function getComponent(
    components: GAddressComponent[],
    type: string,
    useShort = false
): string | undefined {
    const comp: GAddressComponent | undefined = components.find((c) => c.types.includes(type));
    if (!comp) return undefined;
    return useShort ? comp.short_name : comp.long_name;
}

/** Extracts best-guess city with robust fallbacks across countries */
function resolveCity(components: GAddressComponent[]): string | undefined {
    // 1) locality (common)
    const locality = getComponent(components, 'locality');
    if (locality) return locality;

    // 2) postal_town (UK & some regions)
    const postalTown = getComponent(components, 'postal_town');
    if (postalTown) return postalTown;

    // 3) sublocality_level_1 (big cities split into zones; better than neighborhood)
    const sublocality = getComponent(components, 'sublocality_level_1');
    if (sublocality) return sublocality;

    // 4) administrative_area_level_2 (district/county; in India often closest to "city" if locality absent)
    const admin2 = getComponent(components, 'administrative_area_level_2');
    if (admin2) return admin2;

    // 5) administrative_area_level_3 (tehsil/raion/borough in many countries)
    const admin3 = getComponent(components, 'administrative_area_level_3');
    if (admin3) return admin3;

    // 6) neighborhood as a last resort
    const neighborhood = getComponent(components, 'neighborhood');
    if (neighborhood) return neighborhood;

    return undefined;
}

/** Parses all admin fields we care about */
export function parseAdministrativeAddress(components: GAddressComponent[]): ParsedAdministrativeAddress {
    const country: string | undefined = getComponent(components, 'country');
    const countryCode: string | undefined = getComponent(components, 'country', true);
    const state: string | undefined = getComponent(components, 'administrative_area_level_1');
    const district: string | undefined = getComponent(components, 'administrative_area_level_2');
    const adminLevel3: string | undefined = getComponent(components, 'administrative_area_level_3');
    const sublocality: string | undefined = getComponent(components, 'sublocality_level_1');
    const postalCode: string | undefined = getComponent(components, 'postal_code');

    const city: string | undefined = resolveCity(components);

    return {
        city,
        district,
        adminLevel3,
        sublocality,
        state,
        country,
        countryCode,
        postalCode
    };
}

/** Builds a clean "City, State, Country" (with smart fallbacks) */
export function formatAdministrativeLine(addr: ParsedAdministrativeAddress): string {
    // Prefer showing city; if missing, show district/adminLevel3/sublocality instead
    const cityOrClosest: string | undefined =
        addr.city ||
        addr.district ||
        addr.adminLevel3 ||
        addr.sublocality;

    // Typical reading order: City — State/Region — Country
    const parts: string[] = [];
    if (cityOrClosest) parts.push(cityOrClosest);
    if (addr.state) parts.push(addr.state);
    if (addr.country) parts.push(addr.country);

    // If everything above failed (super rare), try whatever we have
    if (parts.length === 0) {
        const rescue = [
            addr.adminLevel3,
            addr.district,
            addr.sublocality,
            addr.country
        ].filter(Boolean) as string[];
        return rescue.join(', ');
    }

    return parts.join(', ');
}
