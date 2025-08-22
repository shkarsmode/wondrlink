import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalRoutes } from '../app-routing.module';
import { AdminComponent } from './admin.component';
import { AddingPostComponent } from './components/adding-post/adding-post.component';
import { EditPostComponent } from './components/edit-post/edit-post.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { PostsComponent } from './components/posts/posts.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SubmissionsComponent } from './components/submissions/submissions.component';
import { UsersComponent } from './components/users/users.component';

enum AdminRoutes {
    Home = '',
    NewPost = 'new-post',
    EditPost = 'edit-post',
    EditUser = 'edit-user',
    Posts = 'posts',
    Users = 'users',
    Submissions = 'submissions',
    Settings = 'settings',
    ParamId = ':id',
}

const routes: Routes = [
    {
        path: AdminRoutes.Home,
        component: AdminComponent,
        children: [
            {
                path: AdminRoutes.Home,
                redirectTo: `/${GlobalRoutes.Admin}/${AdminRoutes.NewPost}`,
                pathMatch: 'full',
            },
            {
                path: AdminRoutes.NewPost,
                component: AddingPostComponent,
            },
            {
                path: `${AdminRoutes.EditPost}/${AdminRoutes.ParamId}`,
                component: EditPostComponent,
            },
            {
                path: `${AdminRoutes.EditUser}/${AdminRoutes.ParamId}`,
                component: EditUserComponent,
            },
            {
                path: AdminRoutes.Posts,
                component: PostsComponent,
            },
            {
                path: AdminRoutes.Users,
                component: UsersComponent,
            },
            {
                path: AdminRoutes.Submissions,
                component: SubmissionsComponent,
            },
            {
                path: AdminRoutes.Settings,
                component: SettingsComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {}
