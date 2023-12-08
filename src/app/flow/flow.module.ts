import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowComponent } from './flow.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/materials/material.module';

// components
import { FlowFormComponent } from './components/flow-form/flow-form.component';
import { FlowSelectComponent } from './components/flow-select/flow-select.component';
import { FlowInitComponent } from './components/flow-init/flow-init.component';
import { FlowDialogComponent } from './components/flow-dialog/flow-dialog.component';


@NgModule({
  declarations: [
    FlowComponent,
    FlowFormComponent,
    FlowSelectComponent,
    FlowInitComponent,
    FlowDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  exports: [
    FlowComponent,
    FlowFormComponent,
    FlowSelectComponent,
    FlowInitComponent,
    FlowDialogComponent,
  ]
})
export class FlowModule { }
