import { Component, Input } from '@angular/core';
import { TFLow } from '../shared/interfaces/TFLow';

export type TUserType = 'Patient' | 'Ecosystem' | 'Drug Developers' | 'Physicians';
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

  // accoring to design for each step we have step 
  // we use it for navigating beetween stages of the flow, accoring to design
  @Input() step: number = 1;

  // the user can reach the Flow page, Ecosystem, Drug-developers ...,
  //  and then we don't need to show init step for him because we already know it, because he is on the appropriate page
  @Input() isFlowStartsFromInit: boolean = false;

  // user can start flow on the page or with opening dialog 
  @Input() isDialog: boolean = false;

  public flowData: FlowData[] = []

  constructor() {}

  ngOnInit(): void {
    this.initFlowDataFirstStep(this.flow);
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

  private determinateUserType(flow: TFLow): TUserType {
    if(flow === 'patients') return 'Patient';
    if(flow === 'drug-developers') return 'Drug Developers';
    if(flow === 'ecosystem') return 'Ecosystem';
    return 'Physicians'
  }

  private initFlowDataFirstStep(flow: TFLow) {
    if(!this.isFlowStartsFromInit) return
    let flowType = this.determinateUserType(flow);
    this.flowData[1] = {
        type: flowType
    }
  }


}
