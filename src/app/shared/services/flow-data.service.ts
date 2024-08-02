import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IFlowSelect } from '../interfaces/IFlowSelect';
import { of, pipe, switchMap } from 'rxjs';

export type TCancerData = { "cancer-types": string[] }

@Injectable({
    providedIn: 'root',
})
export class FlowDataService {
    private flowSelectData: IFlowSelect[] = []; // subgroup, it needs to be flow-subgroup instead of flow-select
    private cancerData: TCancerData;
    private dataUrl: string = 'assets/data/flow-data';
    private _diseaseCatogories: string[] = ['Cancer', 'Autoimmune', 'Rare/Other'];
    private _subgroupFunctionData: {[subgroupTitle: string]: string[]} = {};

    constructor(private http: HttpClient) {}

    public setAllFlowData(): void {
        this.http
            .get<IFlowSelect[]>(this.dataUrl + '/flow-select.json')
            .pipe(
                switchMap((data: IFlowSelect[]) => {
                    this.setSubgroupFunctionData(data);
                    return of(data);
                })
            )
            .subscribe((data: IFlowSelect[]) => (this.flowSelectData = data));

        this.http
            .get<TCancerData>(this.dataUrl + '/cancer-types.json')
            .subscribe((data: TCancerData) => (this.cancerData = data));
    }

    public getCurrenTFormFlowSelectData(id: string): IFlowSelect {
        return this.flowSelectData?.filter((info) => info.id === id)[0];
    }

    public setSubgroupFunctionData(flowSelectData: IFlowSelect[]): void {
        flowSelectData 
            .flatMap(group => group.subgroup || [])
            .filter(subgroup => subgroup.function)
            .forEach(subgroup => {
                this._subgroupFunctionData[subgroup.title] = subgroup.function!
            })
        console.log(this._subgroupFunctionData);
    }
    

    public getCancerTypes(): string[] {
        return Object.values(this.cancerData)[0];
    }

    public get diseaseCatogories(): string[] {
        return this._diseaseCatogories
    }

    public getSubgroupFunctionByTitle(title: string): string[] {
        return this._subgroupFunctionData[title] || [];
    }
    
}
