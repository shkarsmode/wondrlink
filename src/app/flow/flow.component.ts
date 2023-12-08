import { Component, Input } from '@angular/core';
import { TFLow } from '../shared/interfaces/TFLow';
import { TFlowSteps } from '../shared/interfaces/TFlowSteps';

@Component({
  selector: 'app-flow',
  templateUrl: './flow.component.html',
  styleUrls: ['./flow.component.scss']
})
export class FlowComponent {
  @Input() flow: TFLow = 'patients';
  @Input() step: number = 1;
  @Input() isFlowStartsFromInit: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  public onFormFlowInited(newFlow: TFLow) {
    this.flow = newFlow;
  }

  public stepBack(currentStep: number) {
    this.step = currentStep - 1;
  }

  public onStepChange(nextStep: number) {
    this.step = nextStep;
  }
}
