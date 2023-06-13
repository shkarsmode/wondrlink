import { Component, OnInit } from '@angular/core';
import { IPost } from 'src/interfaces/IPost';
import { PostsService } from 'src/services/posts.service';

@Component({
    selector: 'app-blog',
    templateUrl: './blog.component.html',
    styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

    public posts: IPost[];
    public allPostsCount: number;
    public isLoading: boolean = false;
    public pagesCount: number;

    private limit: number = 3; // Number of items per page
    public page: number = 0; // Current page number    

    constructor(
        private postsService: PostsService
    ) {}

    public ngOnInit(): void {
        this.getPosts();
    }

    private setPagesCount(): void {
        this.pagesCount = Math.ceil(this.allPostsCount / this.limit);
        console.log(this.pagesCount)
    }

    private getPosts(isAddToExciting: boolean = false): void {
        this.isLoading = true;
        this.postsService.getPosts(this.limit, this.page)
            .subscribe(response => {
                if (isAddToExciting) {
                    response.posts.forEach(post => this.posts.push(post));
                } else {
                    this.posts = response.posts;
                }
                
                this.allPostsCount = response.allPostsCount;
                
                this.setPagesCount();
                this.isLoading = true;
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
