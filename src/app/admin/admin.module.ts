import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorComponent } from '../shared/components/editor/editor.component';
import { MaterialModule } from '../shared/materials/material.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AddingPostComponent } from './components/adding-post/adding-post.component';
import { EditPostComponent } from './components/edit-post/edit-post.component';
import { EditUserCardSelectComponent } from './components/edit-user/components/edit-user-card-select/edit-user-card-select.component';
import { EditUserCardComponent } from './components/edit-user/components/edit-user-card/edit-user-card.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { PostsComponent } from './components/posts/posts.component';
import { SettingsComponent } from './components/settings/settings.component';
import { UsersComponent } from './components/users/users.component';



@NgModule({
    declarations: [
        AdminComponent,
        AddingPostComponent,
        PostsComponent,
        SettingsComponent,
        EditPostComponent,
        UsersComponent,
        EditUserComponent,
        EditUserCardComponent,
        EditUserCardSelectComponent,
    ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        EditorComponent,
    ],
})
export class AdminModule {}
