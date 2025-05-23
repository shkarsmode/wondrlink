import { Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
    selector: 'app-blog-banner',
    templateUrl: './blog-banner.component.html',
    styleUrls: ['./blog-banner.component.scss']
})
export class BlogBannerComponent implements OnInit {
    private title: Title = inject(Title);
    private meta: Meta = inject(Meta);

    public ngOnInit(): void {
        this.title.setTitle('Blogs | Wondrlink');
        this.meta.updateTag({
            name: 'description', 
            content: 'Bridging Knowledge and Action for a Better Tomorrow' 
        });
        this.meta.updateTag({ property: 'og:title', content: 'Blogs' });
        this.meta.updateTag({ property: 'og:description', content: 'Bridging Knowledge and Action for a Better Tomorrow' });
        this.meta.updateTag({ property: 'og:image', content: 'https://www.wondrlink.com/assets/img/blog-banner.webp' });
        this.meta.updateTag({ property: 'og:image:alt', content: 'Blog Banner' });
        this.meta.updateTag({ property: 'twitter:title', content: 'Blogs' });
        this.meta.updateTag({ property: 'twitter:description', content: 'Bridging Knowledge and Action for a Better Tomorrow' });
        this.meta.updateTag({ property: 'twitter:image', content: 'https://www.wondrlink.com/assets/img/blog-banner.webp' });
        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    }
}
