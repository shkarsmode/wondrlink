import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IInfo } from 'src/app/shared/interfaces/IInfo';
import { FlowComponentConfig, TFormFlow } from 'src/app/shared/interfaces/TFormFlow';
import { ArticleService } from 'src/app/shared/services/article-service.service';
@Component({
    selector: 'app-article-banner',
    templateUrl: './article-banner.component.html',
    styleUrls: ['./article-banner.component.scss'],
})
export class ArticleBannerComponent {
    @ViewChild('wrap', { static: true }) wrap: ElementRef<HTMLDivElement>;
    @Input() article: IInfo;
    @Input() flowConfig: FlowComponentConfig = {
        flow: 'patients',
        step: 1,
        isSkipFirstStep: false
    }

    private articleId: string;

    constructor(
        public articleService: ArticleService
    ) {}

    public ngDoCheck(): void {
        if (this.article?.id && this.articleId === this.article?.id) return;
        this.articleId = this.article?.id;

        this.setBackgroundImage();
    }

    private setBackgroundImage(): void {
        this.wrap.nativeElement.style.backgroundImage = `url('/assets/img/${this.articleId}.webp')`;
    }
}
