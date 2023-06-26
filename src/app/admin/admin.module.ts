import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { MaterialModule } from '../shared/materials/material.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AddingPostComponent } from './components/adding-post/adding-post.component';
import { PostsComponent } from './components/posts/posts.component';
import { SettingsComponent } from './components/settings/settings.component';
import { EditPostComponent } from './components/edit-post/edit-post.component';
import { UsersComponent } from './components/users/users.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';



@NgModule({
    declarations: [
        AdminComponent,
        AddingPostComponent,
        PostsComponent,
        SettingsComponent,
        EditPostComponent,
        UsersComponent,
        EditUserComponent
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
