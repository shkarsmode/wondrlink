import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { IPost } from 'src/app/shared/interfaces/IPost';
import { PostsService } from 'src/app/shared/services/posts.service';

@Component({
    selector: 'app-posts',
    templateUrl: './posts.component.html',
    styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {
    public posts: IPost[];
    public allPostsCount: number;
    public isLoading: boolean = false;
    public pagesCount: number;

    private limit: number = 3; // Number of items per page
    public page: number = 0; // Current page number    
    private deleteTimeout: any;
    public isDeleting: boolean = false;
    public activeDeletingIndex: number = -1;

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

    private deletePostByID(id: number): void {
        const postToDelete = this.posts.filter(post => post.id === id)[0];
        const indexPostToDelete = this.posts.indexOf(postToDelete);
        this.posts = this.posts.filter(post => post.id !== id);

        this.postsService.deletePostById(id)
            .pipe(take(1))
            .subscribe({
                next: _ => {
                    const tempLimit = this.limit;
                    const tempPage = this.page;

                    this.limit = 1;
                    this.page = this.posts.length;

                    this.getPosts(true);

                    this.limit = tempLimit;
                    this.page = tempPage;


                    console.log('Post was deleted')
                },
                error: _ => {
                    this.posts.splice(indexPostToDelete, 0, postToDelete);
                    alert(`Something went wrong. Can't delete post number ${indexPostToDelete + 1}`);
                }
            });
    }

    public startDeleteTimeout(index: number): void {
        this.isDeleting = true;
        this.activeDeletingIndex = index;
        this.deleteTimeout = setTimeout(() => {
            this.deleteItem(index);
        }, 1000); 
    }

    public clearDeleteTimeout(): void {
        clearTimeout(this.deleteTimeout);
        this.activeDeletingIndex = -1;
        this.isDeleting = false;
    }

    public deleteItem(id: number): void {
        this.isDeleting = false;
        this.activeDeletingIndex = -1;

        this.deletePostByID(id);
    }
}
