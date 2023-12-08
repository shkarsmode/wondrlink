import { Component, Input } from '@angular/core';
import { TFLow } from '../shared/interfaces/TFLow';

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

  public onFlowChange(newFlow: TFLow) {
    this.flow = newFlow;
  }

  public onStepBack() {
    this.step--;
  }

  public onNextStep(isNextStep: boolean) {
    if(isNextStep) this.step++;
  }
}
