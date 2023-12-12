import { Component, Input } from '@angular/core';
import { TFLow } from '../shared/interfaces/TFLow';

export type TUserType = 'Patient' | 'Ecosystem' | 'Drug Developers';
export interface FlowData {
  email?: string,
  firstName?: string,
  lastName?: string,
  phone?: string,
  companyName?: string,
  companyType?: string,
  patientSituationType?: string,
  diseaseCategory?: string,
  cancerType?: string,
  diseaseDetails?: string,
  location?: string,
  isMySelf?: boolean,
  type?: TUserType,
}

@Component({
  selector: 'app-flow',
  templateUrl: './flow.component.html',
  styleUrls: ['./flow.component.scss']
})
export class FlowComponent {
  @Input() flow: TFLow = 'patients';
  @Input() step: number = 1;
  @Input() isFlowStartsFromInit: boolean = false;
  @Input() isDialog: boolean = false;

  public flowData: FlowData[] = []

  constructor() {}

  ngOnInit(): void {

  }

  public onFlowChange(newFlow: TFLow) {
    this.flow = newFlow;
  }

  public onStepBack() {
    this.step--;
    this.flowData.pop();
  }

  public onNextStep(flowData: FlowData) {
    if(flowData) {
        this.flowData[this.step] = flowData;
        this.step++;
    }
  }


}
