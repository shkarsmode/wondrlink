import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TFLow } from 'src/app/shared/interfaces/TFLow';

@Component({
    selector: 'app-flow-dialog',
    templateUrl: './flow-dialog.component.html',
    styleUrls: ['./flow-dialog.component.scss'],
})
export class FlowDialogComponent {
    public flow: TFLow = 'patients';
    public step: number = 1;
    public isInit: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<FlowDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    ngOnInit(): void {
        if (this.data) {
            this.flow = this.data.flow;
            this.step = this.data.step;
            this.isInit = this.data.isInit;
        }
    }

    public close() {
        this.dialogRef.close();
    }
}
