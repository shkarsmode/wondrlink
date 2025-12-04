import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgOtpInputConfig, NgOtpInputModule } from 'ng-otp-input';

@Component({
    selector: 'app-confirm-phone-number-form',
    standalone: true,
    imports: [NgOtpInputModule, ReactiveFormsModule],
    templateUrl: './confirm-phone-number-form.component.html',
    styleUrl: './confirm-phone-number-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmPhoneNumberFormComponent {
    private dialogRef: MatDialogRef<ConfirmPhoneNumberFormComponent> = inject(MatDialogRef);
    public data = inject(MAT_DIALOG_DATA);

    public code = new FormControl("", [Validators.required, Validators.minLength(6)]);
    public readonly config: NgOtpInputConfig = {
        length: 6,
        allowNumbersOnly: true,
        inputClass: "otp-custom-input",
        containerClass: "otp-custom-container",
    };

    public close(code?: number | string | null): void {
        this.dialogRef.close(code ? Number(code) : null);
    }
}
