import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreComponent } from './core.component';
import { ApprovePageComponent } from './layouts/approve-page/approve-page.component';
import { ArticleLayoutComponent } from './layouts/article-layout/article-layout.component';
import { BlogLayoutComponent } from './layouts/blog-layout/blog-layout.component';
import { ErrorPageComponent } from './layouts/error-page/error-page.component';
import { PostComponent } from './layouts/home-layout/components/post/post.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { PrivacyPageComponent } from './layouts/privacy-page/privacy-page.component';
import { TermsPageComponent } from './layouts/terms-page/terms-page.component';

    const routes: Routes = [
        {
            path: '',
            component: CoreComponent,
            children: [
                { path: '', component: HomeLayoutComponent },
                { path: 'blogs', component: BlogLayoutComponent },
                { path: 'blogs/:id', component: PostComponent },
                { path: 'not-found', component: ErrorPageComponent },
                { path: 'approve', component: ApprovePageComponent },
                { path: 'privacy', component: PrivacyPageComponent },
                { path: 'terms', component: TermsPageComponent },
                { path: ':articleId', component: ArticleLayoutComponent },
            ],
        },
    ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CoreRoutingModule { }
