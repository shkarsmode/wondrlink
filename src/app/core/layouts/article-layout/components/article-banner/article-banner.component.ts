import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import {
    MatDialog
} from '@angular/material/dialog';
import { FlowDialogComponent } from 'src/app/flow/components/flow-dialog/flow-dialog.component';
import { IInfo } from 'src/app/shared/interfaces/IInfo';
import { TFLow } from 'src/app/shared/interfaces/TFLow';
import { ArticleService } from 'src/app/shared/services/article-service.service';
@Component({
    selector: 'app-article-banner',
    templateUrl: './article-banner.component.html',
    styleUrls: ['./article-banner.component.scss'],
})
export class ArticleBannerComponent {
    @ViewChild('wrap', { static: true }) wrap: ElementRef<HTMLDivElement>;
    @Input() article: IInfo;
    @Input() flow: TFLow;
    private articleId: string;

    public step: number = 2;
    public isInit: boolean = true;

    constructor(
        private dialog: MatDialog,
        private articleService: ArticleService
    ) {}

    public ngDoCheck(): void {
        if (this.article?.id && this.articleId === this.article?.id) return;
        this.articleId = this.article?.id;

        this.setBackgroundImage();
    }

    private setBackgroundImage(): void {
        this.wrap.nativeElement.style.backgroundImage = `url('/assets/img/${this.articleId}.png')`;
    }

    public openFlowDialog(flow: TFLow, isInit: boolean, step: number): void {
        this.articleService.updateArticleFormState('hidden');

        this.dialog.open(FlowDialogComponent, {
            width: '630px',
            data: {
                flow: flow,
                step: step,
                isInit: isInit,
            },
        });

        this.dialog.afterAllClosed.subscribe(() => {
            this.articleService.updateArticleFormState('active');
        });
    }
}
