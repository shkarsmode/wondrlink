import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AllPostsResponseDto } from 'src/interfaces/AllPostsResponse.dto';
import { BASE_PATH_API } from './variables';

@Injectable({
    providedIn: 'root'
})
export class PostsService {

    private readonly postsPath: string = 'posts';

    constructor(
        private http: HttpClient,
        @Inject(BASE_PATH_API) private basePathApi: string
    ) { }


    public getPosts(limit: number, page: number): Observable<AllPostsResponseDto> {
        return this.http.get<AllPostsResponseDto>(
            `${this.basePathApi}/${this.postsPath}/all?limit=${limit}&page=${page}` 
        );
    } 
}
