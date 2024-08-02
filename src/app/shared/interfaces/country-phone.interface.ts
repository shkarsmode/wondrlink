export interface ICountryPhone {
    name: string,
    dial_code: string,
    code: string,
    phoneLength?: number | Array<number>,
    suggested?: boolean,
    min?: number,
    max?: number,
}

export type ICountryPhones = Array<ICountryPhone>;