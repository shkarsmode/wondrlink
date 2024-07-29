import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreComponent } from './core.component';
import { ApprovePageComponent } from './layouts/approve-page/approve-page.component';
import { ArticleLayoutComponent } from './layouts/article-layout/article-layout.component';
import { BlogLayoutComponent } from './layouts/blog-layout/blog-layout.component';
import { PostComponent } from './layouts/home-layout/components/post/post.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { PrivacyPageComponent } from './layouts/privacy-page/privacy-page.component';
import { TermsPageComponent } from './layouts/terms-page/terms-page.component';
import { ErrorPageComponent } from './layouts/error-page/error-page.component';

    const routes: Routes = [
        {
            path: '',
            component: CoreComponent,
            children: [
                { path: '', component: HomeLayoutComponent },
                { path: 'insights', component: BlogLayoutComponent },
                { path: 'insights/:id', component: PostComponent },
                { path: 'approve', component: ApprovePageComponent },
                { path: 'privacy', component: PrivacyPageComponent },
                { path: 'terms', component: TermsPageComponent },
                { path: ':articleId', component: ArticleLayoutComponent },
                { path: 'error', component: ErrorPageComponent },
                { path: '**', component: ErrorPageComponent }
            ],
        },

    ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CoreRoutingModule { }
