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
    public form: FormGroup;
    public currentStep: number = 0;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({});
    }

    public ngOnInit() {
        console.log(this.formConfig);
        this.initializeForm();
    }

    initializeForm() {
        this.formConfig.steps.forEach((step: any) => {
            step.fields?.forEach((field: any) => {
                if (!this.form.contains(field.name)) {
                    const control = new FormControl(
                        '',
                        field.required ? Validators.required : null
                    );
                    this.form.addControl(field.name, control);

                    if (field.conditionalFields) {
                        Object.keys(field.conditionalFields).forEach(
                            (conditionKey) => {
                                field.conditionalFields[conditionKey].forEach(
                                    (conditionalField: any) => {
                                        if (
                                            !this.form.contains(
                                                conditionalField.name
                                            )
                                        ) {
                                            this.form.addControl(
                                                conditionalField.name,
                                                new FormControl('')
                                            );
                                        }
                                    }
                                );
                            }
                        );
                    }
                }
            });
        });
    }

    nextStep() {
        if (this.currentStep < this.formConfig.steps.length - 1) {
            this.currentStep++;
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
        }
    }

    submit() {
        if (this.form.valid) {
            console.log('Form Data:', this.form.value);
        } else {
            console.error('Form is invalid');
        }
    }

    isFieldVisible(field: any) {
        if (field.conditionalFields) {
            const conditionKey = Object.keys(field.conditionalFields)[0];
            return this.form.get(field.name)?.value === conditionKey;
        }
        return true;
    }
}
