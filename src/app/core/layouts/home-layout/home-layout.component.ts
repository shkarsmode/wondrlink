import { AfterViewInit, Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ThankYouComponent } from 'src/app/shared/dialogs/thank-you/thank-you.component';
import { ApprovalService } from 'src/app/shared/services/approval.service';

@Component({
    selector: 'app-home-layout',
    templateUrl: './home-layout.component.html',
    styleUrls: ['./home-layout.component.scss'],
})
export class HomeLayoutComponent implements AfterViewInit {
    private dialogConfig: MatDialogConfig = new MatDialogConfig();

    constructor(
        private readonly dialog: MatDialog,
        private readonly approvalService: ApprovalService
    ) {}

    public ngAfterViewInit(): void {
        this.listenIsApproved();
    }

    private listenIsApproved(): void {
        this.approvalService.approved$.subscribe((isApproved) => {
            if (isApproved) {
                this.initDialogConfig();
                this.openThankYouDialog();
            }
        });
    }

    private initDialogConfig(): void {
        // this.dialogConfig.width = '850px';
        // this.dialogConfig.maxHeight = '750px';
        this.dialogConfig.disableClose = true;
    }

    private openThankYouDialog(): void {
        this.dialog.open(ThankYouComponent, this.dialogConfig);
    }
}
