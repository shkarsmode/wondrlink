import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IInfo } from 'src/app/shared/interfaces/IInfo';
import { ArticleService } from '../../../shared/services/article-service.service';

@Component({
    selector: 'app-article-layout',
    templateUrl: './article-layout.component.html',
    styleUrls: ['./article-layout.component.scss']
})
export class ArticleLayoutComponent implements OnInit {

    public articleId: string;

    public currentInfo: IInfo;
    public statusForm: 'patients' | 'drug-developers' | 'ecosystem' = 'patients';

    constructor(
        private route: ActivatedRoute,
        private articleService: ArticleService
    ) {}

    public ngOnInit(): void {
        this.getInfoOfRoute();
        this.getArticleById();
    }

    private getInfoOfRoute(): void {
        this.route.paramMap.subscribe(params => {
          this.articleId = params.get('articleId') || 'patients';
          this.getArticleById();
        });
    }

    private getArticleById(): void {
      if (!this.articleId) return;
      this.getCurrentArticle();
    }

    private getCurrentArticle(): void {
        this.currentInfo = this.articleService.getCurrentArticle(this.articleId);
        this.determineStatusForForm();
    }

    private determineStatusForForm(): void {
        const articleId = this.currentInfo.id;
        if (articleId === "patients") {
            this.statusForm = 'patients';
        } else if (articleId === "ecosystem") {
            this.statusForm = 'ecosystem';
        } else if (articleId === "drug-developers") {
            this.statusForm = 'drug-developers';
        }
    }
}
