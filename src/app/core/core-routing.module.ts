import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreComponent } from './core.component';
import { ApprovePageComponent } from './layouts/approve-page/approve-page.component';
import { ArticleLayoutComponent } from './layouts/article-layout/article-layout.component';
import { BlogLayoutComponent } from './layouts/blog-layout/blog-layout.component';
import { PostComponent } from './layouts/home-layout/components/post/post.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { TermsLayoutComponent } from './layouts/terms-layout/terms-layout.component';
import { PolicyLayoutComponent } from './layouts/policy-layout/policy-layout.component';

const routes: Routes = [
    { path: '', component: CoreComponent, children: [
        { path: 'terms', component: TermsLayoutComponent },
        { path: 'policy', component: PolicyLayoutComponent },
        { path: '', component: HomeLayoutComponent },
        // { 
        //     path: '', 
        //     pathMatch: 'full', 
        //     redirectTo: 'home' // Redirect to '/home' when the root path is matched
        //   },
    ]}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CoreRoutingModule { }
        // { path: 'articles/:articleId', component: ArticleLayoutComponent },
        // { path: 'blog', component: BlogLayoutComponent },
        // { path: 'blog/:id', component: PostComponent },
        // { path: 'approve', component: ApprovePageComponent },