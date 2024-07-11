import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IInfo } from 'src/app/shared/interfaces/IInfo';
import { TFLow } from 'src/app/shared/interfaces/TFLow';
import { ArticleService } from '../../../shared/services/article-service.service';

@Component({
    selector: 'app-article-layout',
    templateUrl: './article-layout.component.html',
    styleUrls: ['./article-layout.component.scss'],
})
export class ArticleLayoutComponent implements OnInit {
    public articleId: string;

    public currentInfo: IInfo;
    public currentFlow: TFLow;

    constructor(
        private route: ActivatedRoute,
        private readonly router: Router,
        private articleService: ArticleService
    ) {}

    public ngOnInit(): void {
        this.getInfoOfRoute();
        this.getArticleById();
    }

    private getInfoOfRoute(): void {
        this.route.paramMap.subscribe((params) => {
            this.articleId = params.get('articleId') || 'patients';
            this.getArticleById();
        });
    }

    private getArticleById(): void {
        if (!this.articleId) return;

        this.getCurrentArticle();
    }

    private getCurrentArticle(): void {
        this.currentInfo = this.articleService.getCurrentArticle(
            this.articleId
        );
        if (!this.currentInfo) {
            this.router.navigateByUrl('/');
        }
        this._matchCurrentFlow();
    }

    private _matchCurrentFlow(): void {
        const articleId = this.currentInfo.id;

        if (articleId === 'patients') {
            this.currentFlow = 'patients';
        } else if (articleId === 'ecosystem') {
            this.currentFlow = 'ecosystem';
        } else if (articleId === 'drug-developers') {
            this.currentFlow = 'drug-developers';
        } else if (articleId === 'about-us') {
            this.currentFlow = 'about-us';
        }
    }
}
