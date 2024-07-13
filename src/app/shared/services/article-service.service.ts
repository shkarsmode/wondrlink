import { FlowComponentConfig, TFormFlow } from 'src/app/shared/interfaces/TFormFlow';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IInfo } from '../interfaces/IInfo';
import { MatDialog } from '@angular/material/dialog';
import { FlowDialogComponent } from 'src/app/flow/components/flow-dialog/flow-dialog.component';

export type TArticleFormState = 'active' | 'hidden';
@Injectable({
    providedIn: 'root'
})
export class ArticleService {
    private _ArticleFormSubject = new BehaviorSubject<TArticleFormState>('active');
    public articleForm$ = this._ArticleFormSubject.asObservable();

    private formTitle: {[key in TFormFlow]: string} = {
        'patients': "We are fighting together, please sign up here!",
        'drug-developers': "We are fighting together, join us!",
        'physicians': "We are fighting together, please sign up here!",
        'ecosystem': "We are fighting together, join us!",
    }

    public info: IInfo[];


    constructor(
        private http: HttpClient,
        private dialog: MatDialog,
    ) { }

    public updateArticleFormState(state: TArticleFormState): void {
        this._ArticleFormSubject.next(state);
    }

    public reinitArticleForm(): void {
        this.updateArticleFormState('hidden')
        setTimeout(() => {
            this.updateArticleFormState('active');
        }, 1000);
    }

    public setAllArticles(): void {
        this.http.get('assets/data/info.json')
            .subscribe((info: any) => this.info = info.data
        );
    }

    public getCurrentArticle(id: string): IInfo {
        return this.info?.filter(info =>
            info.id === id
        )[0];
    }

    public getFormTitleById(id: TFormFlow): string   {
        return this.formTitle[id];
    }

    public openFlowDialog(flowConfig: FlowComponentConfig = {
            flow: 'patients',
            step: 1,
            isSkipFirstStep: false
        }): void {
        
        this.updateArticleFormState('hidden');

        let dialogRef = this.dialog.open(FlowDialogComponent, {
            width: '850px',
            data: {...flowConfig},
        });

        dialogRef.afterClosed().subscribe(() => {
            this.updateArticleFormState('active');
        });
    }
}
