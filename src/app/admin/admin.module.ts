import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { MaterialModule } from '../shared/materials/material.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AddingPostComponent } from './components/adding-post/adding-post.component';
import { SettingsComponent } from './components/settings/settings.component';
import { TablesComponent } from './components/tables/tables.component';



@NgModule({
    declarations: [
        AdminComponent,
        AddingPostComponent,
        TablesComponent,
        SettingsComponent
    ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        FormsModule,
        QuillModule.forRoot(),
        MaterialModule,
        ReactiveFormsModule
    ]
})
export class AdminModule { }
