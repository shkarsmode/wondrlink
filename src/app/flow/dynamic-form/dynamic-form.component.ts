import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';

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
            this.formConfig.steps[dependedStepOn].fields[0].name;

        const valueForCurrentStep = this.form.get(nameOfHiddenInput)?.value;
        return step.specificForms[valueForCurrentStep];
    }

    public goToNextStep(event: string): void {
        const nameOfHiddenInput =
            this.formConfig.steps[this.currentStep].fields[0].name;

        // if (!this.form.contains(nameOfHiddenInput))
        this.form.get(nameOfHiddenInput)?.setValue(event);

        this.nextStep();
        this.addMoreFieldsToFormBasedOnPreviousStep(event);
    }

    // Supports only one dependence
    private getDependenciesOfStep(): {
        dependedStepOn: number | null;
        indexOfDependedStep: number | null;
    } {
        let dependedStepOn = null;
        let indexOfDependedStep = null;

        this.formConfig.steps.forEach((step: any, index: number) => {
            if (step?.basedOnStep) {
                dependedStepOn = step?.basedOnStep - 1;
                indexOfDependedStep = index;
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

        this.formConfig.steps[indexOfDependedStep]?.specificForms[
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

    public isNotToValidFields: boolean = !!localStorage.getItem('validity');

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

    public submit(): void {
        const result: { [key: string]: { value: string; label: string } } = {};

        Object.keys(this.form.value).forEach((key: string) =>
            this.form.get(key)?.value
                ? (result[key] = {
                    value: this.form.get(key)?.value,
                      // @ts-ignore
                    label: this.form.get(key)?.label,
                }) : null
        );

        console.log('Form Data:', result);
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
