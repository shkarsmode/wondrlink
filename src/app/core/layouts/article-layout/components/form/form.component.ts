import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { TFLow } from 'src/app/shared/interfaces/TFLow';
import { trigger, transition, style, animate } from '@angular/animations';
import { ArticleService, TArticleFormState } from 'src/app/shared/services/article-service.service';
@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
            style({ opacity: 0 }),
            animate('300ms', style({ opacity: 1 })),
            ]),
            transition(':leave', [
            animate('300ms', style({ opacity: 0 })),
            ]),
        ]),
    ]
})
export class FormComponent implements OnInit {
    @Input() flow: TFLow; // depends on article page
    public isLoading: boolean = false;
    public isFlowComponent: boolean = true;

    constructor (
        private articleService: ArticleService,
    ) {}

    ngOnInit(): void {
        this._listenArticleFormState();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes['flow']) this.articleService.reinitArticleForm();
    }

    private _listenArticleFormState () {
        this.articleService.articleForm$.subscribe(state => {
            this._manageArticleFormState(state);
        })
    }

    private _manageArticleFormState(state: TArticleFormState): void {
        switch (state) {
            case 'active':
                this.isLoading = false;
                this.isFlowComponent = true;
                break;
            case 'hidden':
                this.isLoading = true;
                this.isFlowComponent = false;
                break;
            default:
                this.isLoading = false;
                this.isFlowComponent = true;
        }
    }

}
