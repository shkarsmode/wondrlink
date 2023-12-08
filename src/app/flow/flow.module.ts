import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowComponent } from './flow.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/materials/material.module';

// components
import { FlowFormComponent } from './components/flow-form/flow-form.component';


@NgModule({
  declarations: [
    FlowComponent,
    FlowFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  exports: [
    FlowFormComponent
  ]
})
export class FlowModule { }
