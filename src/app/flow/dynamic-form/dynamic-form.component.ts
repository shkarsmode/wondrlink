import { Component, Input } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
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

    public form: FormGroup;
    public currentStep: number = 0;
    public currentVisibleFields: Array<string> = [];

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({});
    }

    public ngOnInit() {
        console.log(this.form);
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
            validators.push(Validators.email);
        }

        if (field.required) {
            validators.push(Validators.required);
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
    
    public get isNextButtonAvailableOnCurrentStep(): boolean {
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
    }

    public submit() {
        const result: { [key: string]: { value: string; label: string } } = {};

        Object.keys(this.form.value).forEach(
            (key: string) =>
                (result[key] = {
                    value: this.form.get(key)?.value,
                    // @ts-ignore
                    label: this.form.get(key)?.label,
                })
        );

        if (this.form.valid) {
            console.log('Form Data:', result);
        } else {
            console.log('Form Data:', result);
            console.error('Form is invalid');
        }
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
