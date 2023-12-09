import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IFlowSelect } from '../interfaces/IFlowSelect';

@Injectable({
  providedIn: 'root'
})
export class FlowSelectService {
  private info: IFlowSelect[] = [];
  private dataUrl: string = 'assets/data/flow-select.json';

  constructor(
      private http: HttpClient
  ) { }


  public setAllFlowSelectData(): void {
    this.http.get(this.dataUrl)
      .subscribe(
        (info: any) => { this.info = info;}
    );
  }

  public getCurrentFlowSelectData(id: string): IFlowSelect {
    console.log(this.info);
    return this.info?.filter(info =>
      info.id === id
    )[0];
  }
}
