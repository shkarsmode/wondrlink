import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AddingPostComponent } from './components/adding-post/adding-post.component';
import { SettingsComponent } from './components/settings/settings.component';
import { TablesComponent } from './components/tables/tables.component';

const routes: Routes = [
  {
    path: '', component: AdminComponent, children: [
      { path: '', redirectTo: '/admin/new-post', pathMatch: 'full' },
      { path: 'new-post', component: AddingPostComponent },
      { path: 'tables', component: TablesComponent },
      { path: 'settings', component: SettingsComponent }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
