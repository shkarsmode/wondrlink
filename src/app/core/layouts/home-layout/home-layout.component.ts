import { AfterViewInit, Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Meta, Title } from '@angular/platform-browser';
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
        private readonly approvalService: ApprovalService,
        private readonly title: Title,
        private readonly meta: Meta,
    ) {}

    public ngAfterViewInit(): void {
        this.title.setTitle('Wondrlink | Connecting Patients to Life-Saving Treatments');
        this.meta.updateTag({
            name: 'description',
            content: 'Wondrlink enables patients with life-threatening illnesses access cutting-edge treatments. We connect patients with the therapies of the future through clinical trials, compassionate use and expanded access programs'
        });
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
        this.dialogConfig.width = '850px';
        this.dialogConfig.maxHeight = '750px';
        this.dialogConfig.disableClose = true;
    }

    private openThankYouDialog(): void {
        this.dialog.open(ThankYouComponent, this.dialogConfig);
    }
}
