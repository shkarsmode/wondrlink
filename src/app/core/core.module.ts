import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { QuillModule } from 'ngx-quill';
import { ShareModule } from 'ngx-sharebuttons';
import { FlowModule } from '../flow/flow.module';
import { MaterialModule } from '../shared/materials/material.module';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { CoreRoutingModule } from './core-routing.module';
import { CoreComponent } from './core.component';
import { ApprovePageComponent } from './layouts/approve-page/approve-page.component';
import { ArticleLayoutComponent } from './layouts/article-layout/article-layout.component';
import { ArticleBannerComponent } from './layouts/article-layout/components/article-banner/article-banner.component';
import { ArticleComponent } from './layouts/article-layout/components/article/article.component';
import { FormComponent } from './layouts/article-layout/components/form/form.component';
import { BlogLayoutComponent } from './layouts/blog-layout/blog-layout.component';
import { BlogBannerComponent } from './layouts/blog-layout/components/blog-banner/blog-banner.component';
import { BlogComingSoonComponent } from './layouts/blog-layout/components/blog-coming-soon/blog-coming-soon.component';
import { BlogNavigationComponent } from './layouts/blog-layout/components/blog-navigation/blog-navigation.component';
import { BlogComponent } from './layouts/blog-layout/components/blog/blog.component';
import { PreviewArticleComponent } from './layouts/blog-layout/components/preview-article/preview-article.component';
import { AboutUsComponent } from './layouts/home-layout/components/about-us/about-us.component';
import { ArticleCardsComponent } from './layouts/home-layout/components/article-cards/article-cards.component';
import { BannerComponent } from './layouts/home-layout/components/banner/banner.component';
import { ContactUsComponent } from './layouts/home-layout/components/contact-us/contact-us.component';
import { FoundationsComponent } from './layouts/home-layout/components/foundations/foundations.component';
import { InfoBlocksComponent } from './layouts/home-layout/components/info-blocks/info-blocks.component';
import { InfoComponent } from './layouts/home-layout/components/info/info.component';
import { IntroductionComponent } from './layouts/home-layout/components/introduction/introduction.component';
import { PostComponent } from './layouts/home-layout/components/post/post.component';
import { PreviewBlogComponent } from './layouts/home-layout/components/preview-blog/preview-blog.component';
import { QuotesComponent } from './layouts/home-layout/components/quotes/quotes.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { PrivacyPageComponent } from './layouts/privacy-page/privacy-page.component';
import { ErrorPageComponent } from './layouts/error-page/error-page.component';
import { ArrowsAnimationComponent } from '../shared/components/arrows-animation/arrows-animation.component';

@NgModule({
    declarations: [
        CoreComponent,
        InfoComponent,
        BlogComponent,
        FormComponent,
        PostComponent,
        HeaderComponent,
        FooterComponent,
        QuotesComponent,
        BannerComponent,
        AboutUsComponent,
        ArticleComponent,
        ContactUsComponent,
        HomeLayoutComponent,
        BlogLayoutComponent,
        BlogBannerComponent,
        FoundationsComponent,
        PreviewBlogComponent,
        ApprovePageComponent,
        IntroductionComponent,
        ArticleCardsComponent,
        ArticleBannerComponent,
        ArticleLayoutComponent,
        PreviewArticleComponent,
        BlogComingSoonComponent,
        BlogNavigationComponent,
        PrivacyPageComponent,
        InfoBlocksComponent,
    ],
    imports: [
        ShareModule,
        FormsModule,
        CommonModule,
        MaterialModule,
        ClipboardModule,
        CoreRoutingModule,
        ReactiveFormsModule,
        QuillModule.forRoot(),
        AngularSvgIconModule.forRoot(),
        FlowModule,
        MatDialogModule,
        ErrorPageComponent,
        ArrowsAnimationComponent,
    ],
    exports: [QuillModule],
    bootstrap: [CoreComponent],
})
export class CoreModule {}
