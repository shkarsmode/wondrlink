import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CheckEmailComponent } from 'src/app/shared/dialogs/check-email/check-email.component';
import { AuthService } from 'src/app/shared/services/auth.service';

const commonRequiredFields = ['email', 'firstName', 'lastName', 'phone', 'password', 'location'];

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss']
})
export class FormComponent {

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

    @Input() public statusForm: 'Patient' | 'Physician' | 'Industry';
    private dialogConfig: MatDialogConfig = new MatDialogConfig();

    private readonly patientRequiredFields = [...commonRequiredFields, 'isMySelf'];
    private readonly physicianRequiredFields = [...commonRequiredFields, 'hospitalName'];
    private readonly industryRequiredFields = [...commonRequiredFields, 'companyName'];

    constructor(
        private dialog: MatDialog,
        private authService: AuthService
    ) {}

    public ngOnInit(): void {
        this.initDialogConfig();
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

        if (!allFieldsFilled) return;

        this.authService.registration(body)
            .subscribe(res =>{
                console.log(res);
                this.openCheckEmailModalWindow();
            });
        
    }


    public openCheckEmailModalWindow(): void {
        const dialogRef = 
            this.dialog.open(CheckEmailComponent, this.dialogConfig);

        dialogRef.afterClosed().subscribe(() => {
            // this.isRegisterButtonClicked = false
        });
    }
}
