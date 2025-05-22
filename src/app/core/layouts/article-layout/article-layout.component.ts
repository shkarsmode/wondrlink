import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IInfo } from 'src/app/shared/interfaces/IInfo';
import { FlowComponentConfig, isTFormFlow, TFormFlow } from 'src/app/shared/interfaces/TFormFlow';
import { ArticleService } from '../../../shared/services/article-service.service';

@Component({
    selector: 'app-article-layout',
    templateUrl: './article-layout.component.html',
    styleUrls: ['./article-layout.component.scss'],
})
export class ArticleLayoutComponent implements OnInit {
    public articleId: string;
    public currentInfo: IInfo;

    public config: FlowComponentConfig = {
        flow: 'patients',
        step: 1,
        isSkipFirstStep: false,
    };

    constructor(
        private route: ActivatedRoute,
        private readonly router: Router,
        private articleService: ArticleService,
        private meta: Meta,
        private title: Title
    ) {}

     public ngOnInit(): void {
        this.getArticleByIdFromRouteParams();
    }

    private getArticleByIdFromRouteParams(): void {
        this.route.paramMap.subscribe((params) => {
            this.articleId = params.get('articleId') || 'patients';
            this.getCurrentArticle();
            this.setupFlowConfig()
        });
    }

    private getCurrentArticle(): void {
        this.currentInfo = this.articleService.getCurrentArticle(this.articleId);

        if (!this.currentInfo) {
            this.router.navigateByUrl('/');
        } else {
            this.updateMetaTags(this.currentInfo);
        }
    }

    private updateMetaTags(info: IInfo): void {
        // this.title.setTitle(post.header);
        this.meta.updateTag({ name: 'description', content: info.subHeader });
        this.meta.updateTag({ property: 'og:title', content: info.header });
        this.meta.updateTag({ property: 'og:description', content: info.subHeader });
        this.meta.updateTag({ property: 'og:image', content: `https://www.wondrlink.com/assets/img/${this.articleId}.webp` });
        this.meta.updateTag({ property: 'og:image:alt', content: this.articleId });
        this.meta.updateTag({
            property: 'og:url', content: `https://www.wondrlink.com/${this.articleId}` });
        this.meta.updateTag({ property: 'twitter:title', content: info.header });
        this.meta.updateTag({ property: 'twitter:description', content: info.subHeader });
        this.meta.updateTag({ property: 'twitter:image', content: `https://www.wondrlink.com/assets/img/${this.articleId}.webp` });
        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    }

    // here we decide if user on page that match to appropirate flow
    private setupFlowConfig(): void {

        if(this.isArticleIdMatchFlowFormType) {
            this.config = {
                flow: this.articleId as TFormFlow,
                step: 2,
                isSkipFirstStep: true
            }
        } else {
            this.config = {
                flow: 'patients',
                step: 1,
                isSkipFirstStep: false
            }
        }
    }

    public get isArticleIdMatchFlowFormType(): boolean {
        return isTFormFlow(this.articleId);
    }
    
   
}
