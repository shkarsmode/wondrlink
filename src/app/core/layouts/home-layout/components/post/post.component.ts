import { Clipboard } from '@angular/cdk/clipboard';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { IPost } from 'src/app/shared/interfaces/IPost';
import { PostsService } from 'src/app/shared/services/posts.service';

interface ShareLinks {
    twitterShareLink: string;
    facebookShareLink: string;
    // Add more properties if needed
}

const shareLinks = {
    twitter: "https://twitter.com/intent/tweet?url=",
    facebook: "https://www.facebook.com/sharer/sharer.php?u=",
    linkedin: "https://www.linkedin.com/sharing/share-offsite/?url="
}
@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

    public post: IPost;
    public isCopied: boolean = false;
    public twitterShareLink: string;
    public facebookShareLink: string;
    public linkedinShareLink: string;
    private readonly copyLink: string = 'https://wondrlink-back.vercel.app/api/posts/shared/';

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
    }


    public async copyCurrentPost() {
        this.isCopied = true;
        this.clipboard.copy(this.copyLink + '/' + this.post.id);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.isCopied = false;
    }

    private listenPostIdFromRoute(): void {
        this.route.params.subscribe(params => {
            const id = +params['id'];
            this.initShareLinksForSocials(id);
            this.getPostDetailsByid(id);
        });
    }

    private initShareLinksForSocials(id: number): void {
        const sharePlatforms: { [key: string]: string } = shareLinks;
        for (const platform in sharePlatforms) {
            if (Object.prototype.hasOwnProperty.call(shareLinks, platform)) {
                const propertyKey = `${platform}ShareLink`;
                this[propertyKey as keyof ShareLinks] = 
                    `${sharePlatforms[platform]}${this.copyLink}${id}`;

                console.log(this[propertyKey as keyof ShareLinks]);
            }
        }
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
