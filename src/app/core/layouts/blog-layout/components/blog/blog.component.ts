import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { IPost } from 'src/app/shared/interfaces/IPost';
import { PostsService } from 'src/app/shared/services/posts.service';

@Component({
    selector: 'app-blog',
    templateUrl: './blog.component.html',
    styleUrls: ['./blog.component.scss'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
            style({ opacity: '0' }),
            animate('.5s ease-in-out', style({ opacity: '1' })),
        ])
    ])]
})
export class BlogComponent implements OnInit {
    public page: number = 0;
    public pagesCount: number;
    public allPostsCount: number;
    public posts: IPost[] = [];
    public isLoading: boolean = false;

    private readonly limit: number = 10;

    constructor(
        private readonly postsService: PostsService
    ) {}

    public ngOnInit(): void {
        this.getPosts();
    }

    private setPagesCount(): void {
        this.pagesCount = Math.ceil(this.allPostsCount / this.limit);
    }

    private getPosts(isAddToExciting: boolean = false): void {
        this.isLoading = true;
        this.postsService.getPosts(this.limit, this.page)
            .pipe(take(1))
            .subscribe(response => {
                this.posts = isAddToExciting ? [...this.posts, ...response.posts] : response.posts;
            
                this.allPostsCount = response.allPostsCount;
                
                this.setPagesCount();
                this.isLoading = false;
            });
    }

    public onPageChange(pageNumber: number) {
        this.page = pageNumber;
        this.getPosts();
    }

    public onButtonMoreClick(): void {
        this.page++;
        this.getPosts(true);
    }

    public forward(): void {
        if (this.page + 1 === this.pagesCount) return;

        this.page++;
        this.getPosts();
    }

    public back(): void {
        if (this.page === 0) return;
        
        this.page--;
        this.getPosts();
    }
}
