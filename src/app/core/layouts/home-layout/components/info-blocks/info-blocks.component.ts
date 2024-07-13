import { Component } from '@angular/core';
import { ArticleService } from 'src/app/shared/services/article-service.service';

@Component({
    selector: 'app-info-blocks',
    templateUrl: './info-blocks.component.html',
    styleUrl: './info-blocks.component.scss',
})
export class InfoBlocksComponent {

    constructor(public articleService: ArticleService) {}
}
