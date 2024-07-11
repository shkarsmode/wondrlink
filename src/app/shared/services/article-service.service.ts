import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IInfo } from '../interfaces/IInfo';

export type TArticleFormState = 'active' | 'hidden';
@Injectable({
    providedIn: 'root'
})
export class ArticleService {
    private _ArticleFormSubject = new BehaviorSubject<TArticleFormState>('active');
    public articleForm$ = this._ArticleFormSubject.asObservable();

    public info: IInfo[];

    constructor(
        private http: HttpClient
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
}
