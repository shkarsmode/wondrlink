import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { TFormFlow, isTFormFlow } from 'src/app/shared/interfaces/TFormFlow';
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
    // if flow was not assigne, isTFormFlow() can check it 
    // and then we need to change @Input config for app-flow
    @Input() flow: TFormFlow; 

    public isLoading: boolean = false;

    // needs to reinit flow component in some part of time
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

    public get formTitle() {
        return this.articleService.getFormTitleById(this.flow);
    }

    
}
