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
    public statusForm: 'Patient' | 'Physician' | 'Industry' = 'Patient';

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
            this.articleId = params.get('articleId') || 'Partients'
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
        const header = this.currentInfo.header;
        if (header.indexOf('Physicians') === 0) {
            this.statusForm = 'Physician';
        } else if (header.indexOf('Patients') === 0) {
            this.statusForm = 'Patient';
        } else if (header.indexOf('Industry') === 0) {
            this.statusForm = 'Industry';
        }
    }
}
