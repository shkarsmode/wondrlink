import { Component, Output, EventEmitter } from '@angular/core';
import { TFLow } from 'src/app/shared/interfaces/TFLow';
import { FlowData, TUserType } from '../../flow.component';

@Component({
  selector: 'app-flow-init',
  templateUrl: './flow-init.component.html',
  styleUrls: ['./flow-init.component.scss']
})
export class FlowInitComponent {
  @Output() flow = new EventEmitter<TFLow>();
  @Output() next = new EventEmitter<FlowData>();

  nextStep(newFlow: TFLow) {
    this.flow.emit(newFlow);
    const userType = this.determinateUserType(newFlow);
    this.next.emit({type: userType});
  }

  determinateUserType(flow: TFLow): TUserType {
    if(flow === 'patients') return 'Patient';
    if(flow === 'drug-developers') return 'Drug Developers';
    return 'Ecosystem'
  }
}
