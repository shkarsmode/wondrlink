import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/materials/material.module';
import { FlowComponent } from './flow.component';

// components
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CountryCodesComponent } from '../shared/components/country-codes/country-codes.component';
import { InputLocationAutocompleteComponent } from '../shared/components/input-location-autocomplete/input-location-autocomplete.component';
import { PhoneInputComponent } from '../shared/components/phone-input/phone-input.component';
import { FormsTooltipDirective } from '../shared/directives/forms-tooltip.directive';
import { FlowDialogComponent } from './components/flow-dialog/flow-dialog.component';
import { FlowInitComponent } from './components/flow-init/flow-init.component';
import { FlowSelectComponent } from './components/flow-select/flow-select.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';



@NgModule({
    declarations: [
        FlowComponent,
        FlowSelectComponent,
        FlowInitComponent,
        FlowDialogComponent,
        DynamicFormComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        MatDialogModule,
        InputLocationAutocompleteComponent,
        CountryCodesComponent,
        PhoneInputComponent,
        FormsTooltipDirective,
        MatTooltipModule,
    ],
    exports: [
        FlowComponent,
        FlowSelectComponent,
        FlowInitComponent,
        FlowDialogComponent,
    ],
})
export class FlowModule {}
