import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { CheckEmailComponent } from '../check-email/check-email.component';

const commonRequiredFields = ['email', 'firstName', 'lastName', 'phone', 'password', 'location'];

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

    public isFirstStep: boolean = true;
    public isLoaded: boolean = false;
    public isSending: boolean = false;

    public isShowPassword: boolean = false;
    public password: any;
    public firstName: any;
    public lastName: any;
    public phone: any;
    public email: any;
    public location: any;
    public hospital: any;
    public company: any;
    public isMySelf: boolean = true;
    public isAgreeTerms: boolean = false;

    public statusForm: 'Patient' | 'Physician' | 'Industry';
    private dialogConfig: MatDialogConfig = new MatDialogConfig();

    private readonly patientRequiredFields = [...commonRequiredFields, 'isMySelf'];
    private readonly physicianRequiredFields = [...commonRequiredFields, 'hospitalName'];
    private readonly industryRequiredFields = [...commonRequiredFields, 'companyName'];

    constructor(
        private dialog: MatDialog,
        private authService: AuthService,
        private dialogRef: MatDialogRef<SignUpComponent>
    ) {}


    public ngOnInit(): void {
        this.removeBugAfterInit();
        this.initDialogConfig();
    }

    private async removeBugAfterInit(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 400));

        this.isLoaded = true;
    }

    public previousStep(): void {
        this.isFirstStep = true;
    }

    public nextStep(state: 'Patient' | 'Physician' | 'Industry'): void {
        this.isFirstStep = false;
        this.statusForm = state;
    }

    public close(): void {
        this.dialogRef.close();
    }

    public toggleShowingPassword(): void {
        this.isShowPassword = !this.isShowPassword;
    }

    public chooseSigningUpFor(isMySelf: boolean): void {
        this.isMySelf = isMySelf;
    }

    private initDialogConfig(): void {
        this.dialogConfig.width = '630px';
        this.dialogConfig.height = '500px';
        this.dialogConfig.disableClose = true;
    }

    public onSubmitButton(formName: 'Patient' | 'Physician' | 'Industry'): void {
        if (this.isSending) return;

        this.isSending = true;

        let requiredFields: string[] = [];
        switch(formName) {
            case 'Patient': requiredFields = this.patientRequiredFields; break;
            case 'Physician': requiredFields = this.physicianRequiredFields; break;
            case 'Industry': requiredFields = this.industryRequiredFields; break;
        }

        const body = {
            email: this.email,
            password: this.password,
            firstName: this.firstName,
            lastName: this.lastName,
            phone: this.phone,
            hospitalName: this.hospital,
            companyName: this.company,
            location: this.location,
            isMySelf: this.isMySelf
        };

        const filteredBody = Object.fromEntries(
            Object.entries(body)
                .filter(([key]) => requiredFields.includes(key))
        );

        const allFieldsFilled = Object.values(filteredBody)
            .every(value => value !== undefined && value !== '');
        console.log(filteredBody);

        if (!allFieldsFilled) {
            this.isSending = false;
            return;
        }

        this.authService.registration(body)
            .subscribe({
                next: _ => {
                    this.openCheckEmailModalWindow();
                    this.isSending = false;
                },
                error: _ => this.isSending = false
            });
        
    }


    public openCheckEmailModalWindow(): void {
        this.dialog.open(CheckEmailComponent, this.dialogConfig);
        this.close();
    }

}
