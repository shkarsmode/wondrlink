import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { IPost } from 'src/app/shared/interfaces/IPost';
import { ProjectTypeEnum } from 'src/app/shared/interfaces/project-type.enum';
import { PostsService } from 'src/app/shared/services/posts.service';

@Component({
    selector: 'app-preview-blog',
    templateUrl: './preview-blog.component.html',
    styleUrls: ['./preview-blog.component.scss']
})
export class PreviewBlogComponent implements OnInit {

    public posts: IPost[]
    private limit: number = 2;
    private page: number = 0;

    constructor(private postsService: PostsService) {}

    public ngOnInit(): void {
        this.getPosts();
    }

    private getPosts(): void {
        this.postsService.getPosts(this.limit, this.page, false, ProjectTypeEnum.Wondrlink)
            .pipe(take(1))
            .subscribe(response => this.posts = response.posts);
    }
}
