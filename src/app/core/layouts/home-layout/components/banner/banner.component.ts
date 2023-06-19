import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SignUpComponent } from 'src/app/shared/dialogs/sign-up/sign-up.component';

@Component({
    selector: 'app-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {

    private dialogConfig: MatDialogConfig = new MatDialogConfig();

    constructor(
        private dialog: MatDialog
    ) {}

    public ngOnInit(): void {
        this.initDialogConfig();
    }

    private initDialogConfig(): void {
        this.dialogConfig.width = '100%';
        this.dialogConfig.maxWidth = '630px';
        this.dialogConfig.minHeight = '400px';
        // this.dialogConfig.disableClose = true;
    }


    public openSignUpDialog(): void {
        const dialogRef = this.dialog.open(SignUpComponent, this.dialogConfig);
    }
}
