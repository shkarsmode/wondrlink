import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { TFLow } from 'src/app/shared/interfaces/TFLow';
import { FlowDataService } from 'src/app/shared/services/flow-data.service';
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
            style({ opacity: 0 }),
            animate('300ms', style({ opacity: 1 })),
            ]),
            transition(':leave', [
            animate('300ms', style({ opacity: 0 })),
            ]),
        ]),
    ]
})
export class FormComponent implements OnInit {
    @Input() statusForm: TFLow;
    public isReInitFlowComponent: boolean = false;
    public isLoading: boolean = false;

    constructor (
        private flowDataService: FlowDataService
    ) {}

    ngOnInit(): void {
        this.listenFlowReInitState()
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes['statusForm']) {
            this.flowDataService.updateFlow(true);
            console.log('new state')
        }
    }

    private listenFlowReInitState () {
        this.flowDataService.$flow.subscribe((state) => {
            this.manageFlowComponent(state)
        })
    }

    private manageFlowComponent(needsToReInit: boolean): void {
        if (!needsToReInit && !this.isReInitFlowComponent) return;

        this.isLoading = true;
        this.isReInitFlowComponent = true;
        setTimeout(() => {
            this.flowDataService.updateFlow(false);
            this.isReInitFlowComponent = false;
        this.isLoading = false;
        }, 1000);
    }

}
