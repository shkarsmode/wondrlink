import { Component, Input } from '@angular/core';
import { IInfo } from 'src/app/shared/interfaces/IInfo';
import { ArticleService } from 'src/app/shared/services/article-service.service';

@Component({
    selector: 'app-article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.scss']
})
export class ArticleComponent {

    @Input() article: IInfo;

    constructor(public articleService: ArticleService) {}

    public get isArticleTypeOfArray(): boolean {
        return typeof this.article?.content === 'object'
    }
}
