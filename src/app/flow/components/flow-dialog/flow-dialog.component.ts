import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-flow-dialog',
  templateUrl: './flow-dialog.component.html',
  styleUrls: ['./flow-dialog.component.scss']
})
export class FlowDialogComponent {

  constructor(private dialogRef: MatDialogRef<FlowDialogComponent>) {
  }

  public close() {
    this.dialogRef.close();
  }

}
