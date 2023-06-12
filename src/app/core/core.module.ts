import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { CoreRoutingModule } from './core-routing.module';
import { CoreComponent } from './core.component';
import { ArticleLayoutComponent } from './layouts/article-layout/article-layout.component';
import { BlogLayoutComponent } from './layouts/blog-layout/blog-layout.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { BannerComponent } from './layouts/home-layout/components/banner/banner.component';
import { ArticleCardsComponent } from './layouts/home-layout/components/article-cards/article-cards.component';
import { FoundationsComponent } from './layouts/home-layout/components/foundations/foundations.component';
import { PreviewBlogComponent } from './layouts/home-layout/components/preview-blog/preview-blog.component';
import { QuotesComponent } from './layouts/home-layout/components/quotes/quotes.component';
import { InfoComponent } from './layouts/home-layout/components/info/info.component';
import { AboutUsComponent } from './layouts/home-layout/components/about-us/about-us.component';
import { ContactUsComponent } from './layouts/home-layout/components/contact-us/contact-us.component';

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
    ],
    imports: [
        CommonModule, 
        CoreRoutingModule
    ],
    bootstrap: [CoreComponent],
})
export class CoreModule {}
