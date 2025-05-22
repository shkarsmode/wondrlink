import { Component, DoCheck, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { IInfo } from 'src/app/shared/interfaces/IInfo';
import { FlowComponentConfig } from 'src/app/shared/interfaces/TFormFlow';
import { ArticleService } from 'src/app/shared/services/article-service.service';
@Component({
    selector: 'app-article-banner',
    templateUrl: './article-banner.component.html',
    styleUrls: ['./article-banner.component.scss'],
})
export class ArticleBannerComponent implements DoCheck, OnDestroy {
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

        this.wrap.nativeElement.classList.remove(this.articleId);
        
        this.articleId = this.article?.id;

        this.setBackgroundImage();
        if (typeof window === 'undefined') return;
        setTimeout(() => {
            document.querySelectorAll('.action-button').forEach(button => button.addEventListener('click', this.handleClickBounded));
        });
    }

    private setBackgroundImage(): void {
        this.wrap.nativeElement.style.backgroundImage = `url('/assets/img/${this.articleId}.webp')`;
        
        this.wrap.nativeElement.classList.add(this.articleId);
    }

    private handleClickBounded = (() => this.articleService.openFlowDialog(this.flowConfig)).bind(this);
    


    public ngOnDestroy(): void {
        if (typeof window === 'undefined') return;

        document.querySelectorAll('.action-button').forEach((button) => button.removeEventListener('click', this.handleClickBounded));
    }
}
