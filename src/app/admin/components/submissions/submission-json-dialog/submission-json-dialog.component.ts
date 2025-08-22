// submission-json-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    template: `
    <h1 mat-dialog-title>Submission Data</h1>
    <mat-dialog-content>
      <pre>{{ data | json }}</pre>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `
})
export class SubmissionJsonDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}
