import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-check-email',
    templateUrl: './check-email.component.html',
    styleUrls: ['./check-email.component.scss']
})
export class CheckEmailComponent {

    constructor(private dialogRef: MatDialogRef<CheckEmailComponent>) {}


    public close(): void {
        this.dialogRef.close();
    }
}
