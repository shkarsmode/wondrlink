import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/materials/material.module';
import { FlowComponent } from './flow.component';

// components
import { MatDialogModule } from '@angular/material/dialog';
import { InputLocationAutocompleteComponent } from '../shared/components/input-location-autocomplete/input-location-autocomplete.component';
import { FlowDetailsComponent } from './components/flow-details/flow-details.component';
import { FlowDialogComponent } from './components/flow-dialog/flow-dialog.component';
import { FlowFormComponent } from './components/flow-form/flow-form.component';
import { FlowInitComponent } from './components/flow-init/flow-init.component';
import { FlowSelectComponent } from './components/flow-select/flow-select.component';
import { CountryCodesComponent } from '../shared/components/country-codes/country-codes.component';
import { PhoneInputComponent } from '../shared/components/phone-input/phone-input.component';



@NgModule({
  declarations: [
    FlowComponent,
    FlowFormComponent,
    FlowSelectComponent,
    FlowInitComponent,
    FlowDialogComponent,
    FlowDetailsComponent
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
  ],
  exports: [
    FlowComponent,
    FlowFormComponent,
    FlowSelectComponent,
    FlowInitComponent,
    FlowDialogComponent,
  ],
})
export class FlowModule { }
