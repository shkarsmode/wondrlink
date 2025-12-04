import { Component, EventEmitter, inject, Input, Output, signal, WritableSignal } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { first } from 'rxjs';
import { ConfirmPhoneNumberFormComponent } from 'src/app/shared/dialogs/confirm-phone-number-form/confirm-phone-number-form.component';
import { StorageService } from 'src/app/shared/services/storage-service.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
    selector: 'app-dynamic-form',
    templateUrl: './dynamic-form.component.html',
    styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent {
    @Input() public formConfig: any;
    @Input() public onParentStepBack: () => void;
    @Output() public onSubmit: EventEmitter<{}> = new EventEmitter();

    public form: FormGroup;
    public currentStep: number = 0;
    public currentVisibleFields: Array<string> = [];
    public phoneToVerify: string = '';
    
    public verificationState: WritableSignal<'pending' | 'sent' | 'verified'> = signal('pending');
    public isLoading = signal(false);

    private storageService: StorageService = inject(StorageService);

    private authService = inject(AuthService);
    private snackBar = inject(MatSnackBar);
    private dialog = inject(MatDialog)
    private dialogConfig: MatDialogConfig = { 
        disableClose: true, 
        width: '400%', 
        height: '400%',
        maxHeight: '400px', 
        maxWidth: '650px',
        data: {
            phone: ''
        }
    };

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({});
    }

    public ngOnInit() {
        this.initializeForm();
        this.updateCurrentFieldsToCheck();
    }
    

    public getCurrentInfoBasedOnStep(step: any): any {
        const { dependedStepOn } = this.getDependenciesOfStep();

        if (!step?.specificForms || dependedStepOn === null) return step;

        const nameOfHiddenInput =
            this.formConfig.steps[dependedStepOn[0]].fields[0].name;

        const valueForCurrentStep = this.form.get(nameOfHiddenInput)?.value;
        return step.specificForms[valueForCurrentStep];
    }

    public sendVerificationCode(): void {
        if (this.form.get('phone')?.invalid || !this.form.get('phone')?.value) {
            this.snackBar.open(
                'Please enter a valid phone number', 
                'Close', {
                    duration: 7000,
                    verticalPosition: 'bottom',
                    horizontalPosition: 'center',
                }
            );
            return;
        }
        this.phoneToVerify = this.form.get('phone')?.value;

        const phone = this.form.get('phone')?.value;
        this.authService.sendVerificationCode(phone)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.verificationState.set('sent');
                    setTimeout(() => {
                        this.dialogConfig.data.phone = phone;
                        this.dialog.open(ConfirmPhoneNumberFormComponent, this.dialogConfig)
                            .afterClosed()
                            .pipe(first())
                            .subscribe((code) => {
                                if (code) this.verifyPhoneCode(code);
                                else {
                                    this.snackBar.open('Verification code was not entered', 'Close', {
                                        duration: 7000,
                                        verticalPosition: 'bottom',
                                        horizontalPosition: 'center',
                                    });
                                    this.verificationState.set('pending');
                                }
                                this.isLoading.set(false);
                            });
                    }, 200);
                },
                error: (error) => {
                    this.snackBar.open('Too many requests', 'Close', {
                        duration: 7000,
                        verticalPosition: 'bottom',
                        horizontalPosition: 'center',
                    });
                    this.isLoading.set(false);
                }
            });
    }

    public verifyPhoneCode(code: string): void {
        this.authService.verifyPhoneCode(this.form.get('phone')?.value, code)
            .subscribe(({ success }) => {
                if (success) this.verificationState.set('verified');
                else this.verificationState.set('pending');

                this.snackBar.open(
                    success ? 
                        'Verification successful' : 'Wrong verification code', 
                    'Close', {
                        duration: 7000,
                        verticalPosition: 'bottom',
                        horizontalPosition: 'center',
                    }
                );

                if (success) this.onSubmit.emit(this.result);
            });
    }

    public goToNextStep(event: string): void {
        const nameOfHiddenInput =
            this.formConfig.steps[this.currentStep].fields[0].name;

        // if (!this.form.contains(nameOfHiddenInput))
        this.form.get(nameOfHiddenInput)?.setValue(event);

        this.nextStep();
        this.addMoreFieldsToFormBasedOnPreviousStep(event);
    }

    // Supports more dependencies
    // * Maybe it's better to have key-map
    private getDependenciesOfStep(): {
        dependedStepOn: number[];
        indexOfDependedStep: number[];
    } {
        let dependedStepOn: number[] = [];
        let indexOfDependedStep: number[] = [];

        this.formConfig.steps.forEach((step: any, index: number) => {
            if (step?.basedOnStep) {
                dependedStepOn.push(step?.basedOnStep - 1);
                indexOfDependedStep.push(index);
            }
        });

        return {
            dependedStepOn,
            indexOfDependedStep,
        };
    }

    public addMoreFieldsToFormBasedOnPreviousStep(event: string): void {
        const { dependedStepOn, indexOfDependedStep } =
            this.getDependenciesOfStep();

        if (dependedStepOn === null || indexOfDependedStep === null) return;

        indexOfDependedStep.forEach(indexOfStep => {
            this.formConfig.steps[indexOfStep]?.specificForms[
                event
            ].fields.forEach((field: any) => {
                if (!this.form.contains(field.name)) {
                    const control = new FormControl(
                        '',
                        this.getValidatorsOfField(field)
                    );
                    // @ts-ignore
                    control.label = field.label;
                    this.form.addControl(field.name, control);
    
                    this.initConditionalFields(field);
                }
            });
        })
    }

    public onClickCustomCheckbox(fieldName: string, option: string): void {
        this.form.get(fieldName)?.setValue(option);
    }

    public initializeForm() {
        this.formConfig.steps.forEach((step: any) => {
            step?.fields?.forEach((field: any) => {
                if (!this.form.contains(field.name)) {
                    const control = new FormControl(
                        field?.defaultValue ?? '',
                        this.getValidatorsOfField(field)
                    );
                    // @ts-ignore
                    control.label = field.label;

                    this.form.addControl(field.name, control);

                    this.initConditionalFields(field);
                }
            });
        });
    }

    public getValidatorsOfField(field: any): Array<any> {
        const validators = [];
        if (field.type === 'email') {
            validators.push(customEmailValidator());
        }

        if (field.required) {
            validators.push(Validators.required);
        }

        if (field.name === 'website') {
            validators.push(customUrlValidator());
        }

        if (field.name === 'age') {
            validators.push(Validators.min(0), Validators.max(120), Validators.pattern('^[0-9]*$'));
        }

        return validators;
    }

    public initConditionalFields(field: any): void {
        if (field.conditionalFields) {
            Object.keys(field.conditionalFields).forEach((conditionKey) => {
                field.conditionalFields[conditionKey].forEach(
                    (conditionalField: any) => {
                        if (!this.form.contains(conditionalField.name)) {
                            const control = new FormControl(
                                conditionalField?.defaultValue ?? '',
                                this.getValidatorsOfField(conditionalField)
                            );
                            // @ts-ignore
                            control.label = conditionalField.label;

                            this.form.addControl(
                                conditionalField.name,
                                control
                            );
                        }
                    }
                );
            });
        }
    }

    public onChangeCheckBox(event: any, fieldName: string): void {
        const checkboxFormControl = this.form.get(fieldName);
        const checkboxFormControlArray = checkboxFormControl?.value
            ? JSON.parse(checkboxFormControl?.value)
            : JSON.parse('[]');

        if (event.target.checked) {
            checkboxFormControlArray.push(event.target.value);
        } else {
            checkboxFormControlArray.splice(
                checkboxFormControlArray.indexOf(event.target.value),
                1
            );
        }

        checkboxFormControl?.setValue(JSON.stringify(checkboxFormControlArray));
    }

    public updateCurrentFieldsToCheck(): void {
        const currentVisibleFields: string[] = [];

        this.getCurrentInfoBasedOnStep(
            this.formConfig.steps[this.currentStep]
        )?.fields?.forEach((field: any) => {
            currentVisibleFields.push(field.name);
            if (field?.conditionalFields && this.isFieldVisible(field)) {
                const name =
                    field.conditionalFields[
                        Object.keys(field.conditionalFields)[0]
                    ][0].name;

                currentVisibleFields.push(name);
            }
        });

        this.currentVisibleFields = currentVisibleFields;
    }

    public isNotToValidFields: boolean = !!this.storageService.get('validity');

    public get isButtonAvailableOnCurrentStep(): boolean {
        return (
            this.isNotToValidFields ||
            this.currentVisibleFields.every(
                (fieldName) => this.form.get(fieldName)?.valid
            )
        );
    }

    public onPhoneValidityChange(isValid: boolean, fieldName: string): void {
        setTimeout(() => {
            this.form
                .get(fieldName)
                ?.setErrors(isValid ? null : { invalidPhone: true });

            if (this.phoneToVerify !== this.form.get(fieldName)?.value) {
                this.verificationState.set('pending');
            }
        });
    }

    public nextStep(): void {
        if (this.currentStep < this.formConfig.steps.length - 1) {
            this.currentStep++;
            this.updateCurrentFieldsToCheck();
            this.scrollToTop();
        }
    }

    public prevStep(): void {
        if (this.currentStep === 0) {
            this.onParentStepBack();
            return;
        }
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateCurrentFieldsToCheck();
        }
        this.scrollToTop();
    }

    private scrollToTop(): void {
        document.querySelector('app-flow-dialog .wrap')?.scroll(0, 0)
    }

    public result: { [key: string]: { value: string; label: string } } = {};
    public submit(): void {
        this.isLoading.set(true);
        const result: { [key: string]: { value: string; label: string } } = {};

        Object.keys(this.form.value).forEach((key: string) =>
            this.form.get(key)?.value
                ? (result[key] = {
                    value: this.form.get(key)?.value,
                      // @ts-ignore
                    label: this.form.get(key)?.label,
                }) : null
        );

        this.result = result;

        if (result['phone']?.value) {
            this.sendVerificationCode();
            return;
        }
        this.onSubmit.emit(result);
    }

    public onDropDownForConditionalFieldsChangeEvent(field: any): void {
        if (!field?.conditionalFields) return;

        Object.keys(field.conditionalFields).forEach((key) => {
            this.form.get(field.conditionalFields[key][0].name)?.setValue('');
        });

        this.updateCurrentFieldsToCheck();
    }

    public isFieldVisible(field: any) {
        if (field.conditionalFields) {
            const conditionKey = Object.keys(field.conditionalFields)[0];
            const isFieldVisible =
                this.form.get(field.name)?.value === conditionKey;

            return isFieldVisible;
        }
        return true;
    }

    public get isCurrentButtonNext(): boolean {
        return this.currentStep < this.formConfig.steps.length - 1;
    }
}

export function customEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const email = control.value;

        if (!email) {
            return null;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const suspiciousCharacters = /[<>()[\]{};:'"\\|,]/;

        if (!emailRegex.test(email)) {
            return { invalidEmailFormat: true };
        }

        if (suspiciousCharacters.test(email)) {
            return { suspiciousCharactersFound: true };
        }

        // Example of domain restriction (e.g., only allowing emails with example.com)
        // const allowedDomain = 'example.com';
        // const emailDomain = email.split('@')[1];
        // if (emailDomain && emailDomain !== allowedDomain) {
        //     return { domainNotAllowed: true };
        // }

        return null; // Passes validation
    };
}

export function customUrlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const url = control.value;

        if (!url) {
            return null; // No need to validate if the field is empty
        }

        // Regular expression to validate URLs in various formats (e.g., http, https, ftp, mailto, etc.)
        const urlRegex = /^(https?|ftp|mailto|file):\/\/[^\s/$.?#].[^\s]*$/i;

        // Additional check to allow URLs without any protocol (e.g., "www.example.com")
        const urlWithoutProtocolRegex = /^[^\s/$.?#].[^\s]*\.[a-z]{2,}$/i;

        // Combining the checks to allow URLs with or without protocols
        if (!urlRegex.test(url) && !urlWithoutProtocolRegex.test(url)) {
            return { invalidUrlFormat: true };
        }

        return null; // Passes validation
    };
}
