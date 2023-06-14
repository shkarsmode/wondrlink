import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/helpers/auth.guard';

const routes: Routes = [
  {
    path: '', 
    loadChildren: () => import('./core/core.module')
      .then(m => m.CoreModule)
  },
  {
    path: 'login', 
    loadChildren: () => import('./login/login.module')
      .then(m => m.LoginModule)
  },
  {
    path: 'admin', canActivate: [AuthGuard],
    loadChildren: () => import('./admin/admin.module')
      .then(m => m.AdminModule)
  },
  {
    path: '**', redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
