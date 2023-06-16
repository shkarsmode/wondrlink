import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AllPostsResponseDto } from 'src/app/shared/interfaces/AllPostsResponse.dto';
import { IPost } from '../interfaces/IPost';
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

    public getCountOfPostsByUserId(userId: number): Observable<number> {
        return this.http.get<number>(
            `${this.basePathApi}/${this.postsPath}/count?id=${userId}` 
        );
    }

    public getPostById(id: number): Observable<IPost> {
        return this.http.get<IPost>(
            `${this.basePathApi}/${this.postsPath}/${id}` 
        );
    }

    public uploadPost(post: IPost): Observable<IPost> {
        return this.http.post<IPost>(
            `${this.basePathApi}/${this.postsPath}`, post
        );
    }
}
