import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/helpers/auth.guard';

export enum GlobalRoutes {
    Login = 'login',
    Admin = 'admin',
    Home = '',
    Any = '**'
}

const routes: Routes = [
    {
        path: GlobalRoutes.Login,
        loadChildren: () =>
            import('./login/login.module').then((m) => m.LoginModule),
    },
    {
        path: GlobalRoutes.Admin,
        canActivate: [AuthGuard],
        loadChildren: () =>
            import('./admin/admin.module').then((m) => m.AdminModule),
    },
    {
        path: GlobalRoutes.Home,
        loadChildren: () =>
            import('./core/core.module').then((m) => m.CoreModule),
    },
    { path: GlobalRoutes.Any, redirectTo: GlobalRoutes.Home },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
