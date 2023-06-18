import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AddingPostComponent } from './components/adding-post/adding-post.component';
import { PostsComponent } from './components/posts/posts.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  {
    path: '', component: AdminComponent, children: [
      { path: '', redirectTo: '/admin/new-post', pathMatch: 'full' },
      { path: 'new-post', component: AddingPostComponent },
      { path: 'posts', component: PostsComponent },
      { path: 'settings', component: SettingsComponent }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
