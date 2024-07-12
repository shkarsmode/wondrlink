import { Component, Input } from '@angular/core';
import { TFormFlow } from '../shared/interfaces/TFormFlow';
import { matchFlowUserType } from '../shared/features/matchFlowUserType.helper';

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
  @Input() flow: TFormFlow = 'patients';

  // accoring to design for each step we have step 
  // we use it for navigating beetween stages of the flow, accoring to design
  @Input() step: number = 1;

  // the user can reach the Flow page, Ecosystem, Drug-developers ...,
  //  and then we don't need to show init step for him because we already know it, because he is on the appropriate page
  // also it needs when to show arrow-back in template  
  @Input() isSkipFirstStep: boolean = false;

  // user can start flow on the page or with opening dialog 
  // @Input() isDialog: boolean = false;

  public flowData: FlowData[] = []

  constructor() {}

  ngOnInit(): void {
    this.initFormFlowDataFirstStep(this.flow);
  }

  public onFlowChange(newFlow: TFormFlow) {
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

  private initFormFlowDataFirstStep(flow: TFormFlow) {
    if(!this.isSkipFirstStep) return
    let flowType = matchFlowUserType(flow);
    this.flowData[1] = {
        type: flowType
    }
  }


}
