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
import { affiliationData } from 'src/assets/data/flow-data/affiliation.data';
import { AFFILIATION_DATA } from '../shared/tokens/affiliation-data.token';
import { SPECIALITY_DATA } from '../shared/tokens/speciality-data.token';
import { specialityData } from 'src/assets/data/flow-data/specialization.data';


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
    CountryCodesComponent
  ],
  exports: [
    FlowComponent,
    FlowFormComponent,
    FlowSelectComponent,
    FlowInitComponent,
    FlowDialogComponent,
  ],
  providers: [
    {provide: AFFILIATION_DATA, useValue: affiliationData },
    {provide: SPECIALITY_DATA, useValue: specialityData } 
  ]
})
export class FlowModule { }
