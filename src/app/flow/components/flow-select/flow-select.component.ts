import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TFormFlow } from 'src/app/shared/interfaces/TFormFlow';
import { FlowDataService } from 'src/app/shared/services/flow-data.service';

@Component({
    selector: 'app-flow-select',
    templateUrl: './flow-select.component.html',
    styleUrls: ['./flow-select.component.scss'],
})
export class FlowSelectComponent {
    @Output() next = new EventEmitter<string>();
    @Input() flowType: TFormFlow = 'patients';
    @Input() public data: any;
    @Input() public isInline: any;

    public selectOptions: boolean[] = [false, false, false, false];
    public checkedItem: string = '';

    private oldFlowType: TFormFlow;

    constructor(private flowSelectService: FlowDataService) {}

    public ngOnInit(): void {
        // this.oldFlowType = this.flowType;
        // this.getCurrentSelecTFormFlowData(this.flowType);
    }

    ngDoCheck(): void {
        if (this.oldFlowType === this.flowType) return;
        if (this.oldFlowType !== this.flowType) {
            this.resetSelectOptions();
            this.checkedItem = '';
            // this.getCurrentSelecTFormFlowData(this.flowType);
            this.oldFlowType = this.flowType;
        }
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
        this.next.emit(checkedItem);
        // if (this.flowType === 'patients')
        //     this.next.emit({ patientSituationType: checkedItem });
        // else this.next.emit({ companyType: checkedItem });
    }
}
