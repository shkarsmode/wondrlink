import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FlowDialogComponent } from 'src/app/flow/components/flow-dialog/flow-dialog.component';

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
        this.dialogConfig.width = '850px';
        this.dialogConfig.maxWidth = "100dvw";
    }

    public openSignUpDialog(): void {
        const dialogRef = this.dialog.open(FlowDialogComponent, this.dialogConfig);
    }

    public scrollDown(): void {
        window.scrollTo({
            top: window.innerHeight, // Scroll 100 pixels down from the current position
            left: 0,
            behavior: 'smooth' // Smooth scrolling,

        });
    }

}
