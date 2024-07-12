import { Component, OnInit, inject } from '@angular/core';
import { first } from 'rxjs';
import { IPost } from 'src/app/shared/interfaces/IPost';
import { PostsService } from 'src/app/shared/services/posts.service';

@Component({
    selector: 'app-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnInit {
    private readonly limit: number = 2;
    private readonly page: number = 0;
    private readonly postsService: PostsService = inject(PostsService);

    public posts: IPost[] = [];

    public ngOnInit(): void {
        this.getLatestPosts();
    }

    private getLatestPosts(): void {
        this.postsService
            .getPosts(this.limit, this.page)
            .pipe(first())
            .subscribe(({ posts }) => this.posts = posts );
    }
}
