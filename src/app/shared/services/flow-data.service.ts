import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IFlowSelect } from '../interfaces/IFlowSelect';

export type TCancerData = { "cancer-types": string[] }

@Injectable({
    providedIn: 'root',
})
export class FlowDataService {
    private flowSelectData: IFlowSelect[] = [];
    public cancerData: TCancerData;
    private dataUrl: string = 'assets/data/flow-data';
    private _diseaseCatogories: string[] = ['Cancer', 'Autoimmune', 'Rare/Other'];

    constructor(private http: HttpClient) {}

    public setAllFlowData(): void {
        this.http
            .get<IFlowSelect[]>(this.dataUrl + '/flow-select.json')
            .subscribe((data: IFlowSelect[]) => (this.flowSelectData = data));

        this.http
            .get<TCancerData>(this.dataUrl + '/cancer-types.json')
            .subscribe((data: TCancerData) => (this.cancerData = data));
    }

    public getCurrentFlowSelectData(id: string): IFlowSelect {
        return this.flowSelectData?.filter((info) => info.id === id)[0];
    }

    public getCancerTypes(): string[] {
        return Object.values(this.cancerData)[0];
    }

    public get diseaseCatogories(): string[] {
        return this._diseaseCatogories
    }
}
