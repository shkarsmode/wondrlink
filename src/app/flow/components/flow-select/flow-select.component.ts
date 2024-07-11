import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IFlowSelect } from 'src/app/shared/interfaces/IFlowSelect';
import { TFLow } from 'src/app/shared/interfaces/TFLow';
import { FlowDataService } from 'src/app/shared/services/flow-data.service';
import { FlowData } from '../../flow.component';

@Component({
    selector: 'app-flow-select',
    templateUrl: './flow-select.component.html',
    styleUrls: ['./flow-select.component.scss'],
})
export class FlowSelectComponent {
    @Output() next = new EventEmitter<FlowData>();
    @Input() flowType: TFLow = 'patients';

    public selectOptions: boolean[] = [false, false, false, false];
    public checkedItem: string = '';

    public currentFlowData: IFlowSelect;
    private oldFlowType: TFLow;

    constructor(private flowSelectService: FlowDataService) {}

    ngOnInit(): void {
        this.oldFlowType = this.flowType;
        this.getCurrentSelectFlowData(this.flowType);
    }

    ngDoCheck(): void {
        if (this.oldFlowType === this.flowType) return;
        if (this.oldFlowType !== this.flowType) {
            this.resetSelectOptions();
            this.checkedItem = '';
            this.getCurrentSelectFlowData(this.flowType);
            this.oldFlowType = this.flowType;
        }
    }

    private getCurrentSelectFlowData(id: string) {
        this.currentFlowData =
            this.flowSelectService.getCurrentFlowSelectData(id);
    }

    public toggleCheck(index: number, itemName: string) {
        this.checkedItem = itemName;

        this.selectOptions.map((el, i) => {
            if (index === i) {
                this.selectOptions[i] = true;
            } else {
                this.selectOptions[i] = false;
            }
        });
        this.onNextStepButton();
    }

    private resetSelectOptions() {
        this.selectOptions.fill(false);
    }

    public onNextStepButton(): void {
        const checkedItem = this.checkedItem;
        if (this.flowType === 'patients')
            this.next.emit({ patientSituationType: checkedItem });
        else this.next.emit({ companyType: checkedItem });
    }

    // write login with next step, sending data into parent
}
