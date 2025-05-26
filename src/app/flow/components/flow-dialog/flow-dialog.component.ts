import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FlowComponentConfig, TFormFlow } from 'src/app/shared/interfaces/TFormFlow';


@Component({
    selector: 'app-flow-dialog',
    templateUrl: './flow-dialog.component.html',
    styleUrls: ['./flow-dialog.component.scss']
})

export class FlowDialogComponent {

    // flow component config
    public flow: TFormFlow = 'patients';
    public step: number = 1;
    public isInit: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<FlowDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: FlowComponentConfig
    ) {

    }

    ngOnInit(): void {
        if (this.data) {
            this.flow = this.data.flow;
            this.step = this.data.step;
            this.isInit = this.data.isSkipFirstStep;
            if (this.isInit) {
                if (typeof window !== 'undefined')
                    history.pushState(null, '', `${this.flow}?form=true`);
            }
        }

    }

    public close() {
        this.dialogRef.close();
        if (typeof window !== 'undefined')
            history.pushState(null, '', `${this.flow}`);
    }

}
