import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IInfo } from 'src/app/shared/interfaces/IInfo';

@Component({
    selector: 'app-article-layout',
    templateUrl: './article-layout.component.html',
    styleUrls: ['./article-layout.component.scss']
})
export class ArticleLayoutComponent implements OnInit {

    public articleId: string;
    public info: IInfo[];
    public currentInfo: IInfo;
    public statusForm: 'Patient' | 'Physician' | 'Industry' = 'Patient';

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient
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

        this.http.get('assets/data/info.json')
            .subscribe((info: any) => {
                this.info = info.data;
                this.getCurrentArticle();
            });
    }

    private getCurrentArticle(): void {
        this.currentInfo = this.info.filter(info => 
            info.header.toLowerCase() === this.articleId.toLowerCase()
        )[0];
        this.determineStatusForForm();
    }

    private determineStatusForForm(): void {
        const header = this.currentInfo.header;
        if (header.indexOf('Physicians') === 0) {
            this.statusForm = 'Physician';
        }else if (header.indexOf('Patients') === 0) {
            this.statusForm = 'Patient';
        } else if (header.indexOf('Industry') === 0) {
            this.statusForm = 'Industry';
        }
    }
}
