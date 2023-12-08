import { Component, Output, Input, EventEmitter } from '@angular/core';
import { IFlowSelect } from 'src/app/shared/interfaces/IFlowSelect';
import { TFLow } from 'src/app/shared/interfaces/TFLow';
import { TFlowSteps } from 'src/app/shared/interfaces/TFlowSteps';
import { FlowSelectService } from 'src/app/shared/services/flow-select.service';

@Component({
  selector: 'app-flow-select',
  templateUrl: './flow-select.component.html',
  styleUrls: ['./flow-select.component.scss']
})
export class FlowSelectComponent {
  @Output() step = new EventEmitter<TFlowSteps>();
  @Input() flowType: TFLow = 'patients';

  public selectOptions: boolean[] = [false, false, false, false];
  public checkedItem: string = '';

  public currentFlowData: IFlowSelect;
  private oldFlowType: TFLow

  constructor(
    private flowSelectService: FlowSelectService
  ) {}

  ngOnInit(): void {
    this.oldFlowType = this.flowType;
    this.getCurrentSelectFlowData(this.flowType);
  }

  ngDoCheck(): void {
    if(this.oldFlowType === this.flowType) return
    if(this.oldFlowType !== this.flowType) {
      this.resetSelectOptions();
      this.checkedItem = '';
      this.getCurrentSelectFlowData(this.flowType);
      this.oldFlowType = this.flowType;
    }
  }

  private getCurrentSelectFlowData(id: string) {
    this.currentFlowData = this.flowSelectService.getCurrentFlowSelectData(id);
  }

  public toggleCheck(index: number, itemName: string) {
    this.checkedItem = itemName;
    this.selectOptions.map((el, i) => {
      if(index === i) {
        this.selectOptions[i] = true;
      }
      else {
        this.selectOptions[i] = false;
      }
    });
  }

  private resetSelectOptions() {
    this.selectOptions.fill(false);
  }

  public onNextStepButton(): void {
      console.log(this.checkedItem);
      //emit next step
  }

  // write login with next step, sending data into parent

}
