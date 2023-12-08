import { Component, Output, EventEmitter } from '@angular/core';
import { TFLow } from 'src/app/shared/interfaces/TFLow';
import { TFlowSteps } from 'src/app/shared/interfaces/TFlowSteps';

@Component({
  selector: 'app-flow-init',
  templateUrl: './flow-init.component.html',
  styleUrls: ['./flow-init.component.scss']
})
export class FlowInitComponent {
  @Output() flow = new EventEmitter<TFLow>();
  @Output() next = new EventEmitter<boolean>();

  nextStep(newFlow: TFLow) {
    this.flow.emit(newFlow);
    this.next.emit(true);
  }
}
