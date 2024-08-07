import { Component, OnInit } from '@angular/core';
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
        private articleService: ArticleService
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
        }
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
