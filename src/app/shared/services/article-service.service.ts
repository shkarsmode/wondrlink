import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IInfo } from '../interfaces/IInfo';

@Injectable({
    providedIn: 'root'
})
export class ArticleService {

    public info: IInfo[];

    constructor(
        private http: HttpClient
    ) { }

    public setAllArticles(): void {
        this.http.get('assets/data/info.json')
            .subscribe((info: any) => this.info = info.data
        );
    }

    public getCurrentArticle(id: string): IInfo {
        return this.info?.filter(info => 
            info.header.toLowerCase() === id.toLowerCase()
        )[0];
    }
}
