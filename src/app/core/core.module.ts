import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/materials/material.module';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { CoreRoutingModule } from './core-routing.module';
import { CoreComponent } from './core.component';
import { ArticleLayoutComponent } from './layouts/article-layout/article-layout.component';
import { ArticleBannerComponent } from './layouts/article-layout/components/article-banner/article-banner.component';
import { ArticleComponent } from './layouts/article-layout/components/article/article.component';
import { FormComponent } from './layouts/article-layout/components/form/form.component';
import { BlogLayoutComponent } from './layouts/blog-layout/blog-layout.component';
import { BlogBannerComponent } from './layouts/blog-layout/components/blog-banner/blog-banner.component';
import { BlogComponent } from './layouts/blog-layout/components/blog/blog.component';
import { PreviewArticleComponent } from './layouts/blog-layout/components/preview-article/preview-article.component';
import { AboutUsComponent } from './layouts/home-layout/components/about-us/about-us.component';
import { ArticleCardsComponent } from './layouts/home-layout/components/article-cards/article-cards.component';
import { BannerComponent } from './layouts/home-layout/components/banner/banner.component';
import { ContactUsComponent } from './layouts/home-layout/components/contact-us/contact-us.component';
import { FoundationsComponent } from './layouts/home-layout/components/foundations/foundations.component';
import { InfoComponent } from './layouts/home-layout/components/info/info.component';
import { PreviewBlogComponent } from './layouts/home-layout/components/preview-blog/preview-blog.component';
import { QuotesComponent } from './layouts/home-layout/components/quotes/quotes.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { ApprovePageComponent } from './layouts/approve-page/approve-page.component';

@NgModule({
    declarations: [
        CoreComponent,
        HeaderComponent,
        FooterComponent,
        HomeLayoutComponent,
        BlogLayoutComponent,
        ArticleLayoutComponent,
        BannerComponent,
        ArticleCardsComponent,
        FoundationsComponent,
        PreviewBlogComponent,
        QuotesComponent,
        InfoComponent,
        AboutUsComponent,
        ContactUsComponent,
        BlogComponent,
        BlogBannerComponent,
        PreviewArticleComponent,
        ArticleComponent,
        ArticleBannerComponent,
        FormComponent,
        ApprovePageComponent
    ],
    imports: [
        CommonModule, 
        CoreRoutingModule,
        FormsModule,
        MaterialModule
    ],
    bootstrap: [CoreComponent],
})
export class CoreModule {}
