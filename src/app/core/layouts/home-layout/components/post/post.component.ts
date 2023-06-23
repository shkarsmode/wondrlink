import { Clipboard } from '@angular/cdk/clipboard';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { IPost } from 'src/app/shared/interfaces/IPost';
import { PostsService } from 'src/app/shared/services/posts.service';

@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

    public post: IPost;
    public isCopied: boolean = false; 

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private postsService: PostsService,
        private location: Location,
        private clipboard: Clipboard,
        private meta: Meta, private title: Title
    ) {}

    public ngOnInit(): void {
        this.listenPostIdFromRoute();
        this.title.setTitle('contenttitle1234');

        this.meta.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ property: 'twitter:site', content: 'WondrLink' });
        this.meta.updateTag({ property: 'twitter:title', content: 'asdfasdf' });
        this.meta.updateTag({ property: 'twitter:description', content: 'dessadfasdf' });
        this.meta.updateTag({ property: 'twitter:image:src', content: 'https://dynaimage.cdn.cnn.com/cnn/digital-images/org/1585ce23-16c0-4db4-b3a2-8d5d6efa8f89.jpg' });
    }

    public async copyCurrentPost() {
        this.isCopied = true;
        // const currentUrl = window.location.href;
        // this.clipboard.copy(currentUrl);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.isCopied = false;
    }

    private listenPostIdFromRoute(): void {
        this.route.params.subscribe(params => {
            const id = +params['id'];
            this.getPostDetailsByid(id);
        });
    }

    private getPostDetailsByid(id: number): void {
        this.postsService.getPostById(id)
            .pipe(take(1))
            .subscribe({
                next: post => this.post = post,
                error: _ => this.router.navigate(['/'])
            });
    }

    public goBack = () => this.location.back();
}
