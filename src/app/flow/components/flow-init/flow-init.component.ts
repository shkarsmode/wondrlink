import { Component, Output, EventEmitter } from '@angular/core';
import { TFormFlow } from 'src/app/shared/interfaces/TFormFlow';
import { FlowData, TUserType } from '../../flow.component';
import { matchFlowUserType } from 'src/app/shared/features/matchFlowUserType.helper';

@Component({
  selector: 'app-flow-init',
  templateUrl: './flow-init.component.html',
  styleUrls: ['./flow-init.component.scss']
})
export class FlowInitComponent {
  @Output() flow = new EventEmitter<TFormFlow>();
  @Output() next = new EventEmitter<FlowData>();

  nextStep(newFlow: TFormFlow) {
    this.flow.emit(newFlow);
    const userType = matchFlowUserType(newFlow);
    this.next.emit({type: userType});
  }

}
