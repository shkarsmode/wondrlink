import { Component, Input } from '@angular/core';
import { IInfo } from 'src/app/shared/interfaces/IInfo';

@Component({
    selector: 'app-article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.scss']
})
export class ArticleComponent {

    @Input() article: IInfo;
}
