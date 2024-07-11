import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApprovalService } from '../../services/approval.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent {

    constructor(
        private approvalService: ApprovalService,
        private dialogRef: MatDialogRef<ThankYouComponent>) {}

    public close(): void {
        this.dialogRef.close();
        this.approvalService.accessApprovedDialog(false);
    }
}
