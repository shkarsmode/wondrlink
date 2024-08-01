import { Clipboard } from '@angular/cdk/clipboard';
import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
    twitter: "https://x.com/intent/tweet?url=",
    facebook: "https://www.facebook.com/sharer/sharer.php?u=",
    linkedin: "https://www.linkedin.com/sharing/share-offsite/?url="
}
@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {
    public post: IPost;
    public isCopied: boolean = false;
    public twitterShareLink: string;
    public facebookShareLink: string;
    public linkedinShareLink: string;
    private readonly copyLink: string =
        'https://wondrlink.com/api/posts/shared/';

    @ViewChild('wrap', { static: true }) wrap: ElementRef<HTMLDivElement>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private postsService: PostsService,
        private location: Location,
        private clipboard: Clipboard,
        private meta: Meta,
        private title: Title
    ) {}

    public ngOnInit(): void {
        this.listenPostIdFromRoute();
    }

    private setBackgroundImage(): void {
        // this.wrap.nativeElement.style.backgroundImage = `url('${this.post.mainPicture}')`;
    }

    public async copyCurrentPost() {
        this.isCopied = true;
        this.clipboard.copy(this.copyLink + this.post.id);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        this.isCopied = false;
    }

    private listenPostIdFromRoute(): void {
        this.route.params.subscribe((params) => {
            const id = +params['id'];
            this.getPostDetailsById(id);
        });
    }

    private initShareLinksForSocials(id: number): void {
        const sharePlatforms: { [key: string]: string } = shareLinks;
        for (const platform in sharePlatforms) {
            if (Object.prototype.hasOwnProperty.call(shareLinks, platform)) {
                const propertyKey = `${platform}ShareLink`;
                const title = this.post.header;
                const via = 'Wondrlnk';

                this[
                    propertyKey as keyof ShareLinks
                ] = `${sharePlatforms[platform]}${this.copyLink}${id}&text=${title}&via=${via}`;

                console.log(this[propertyKey as keyof ShareLinks]);
            }
        }
    }

    private getPostDetailsById(id: number): void {
        this.postsService
            .getPostById(id)
            .pipe(take(1))
            .subscribe({
                next: (post) => {
                    this.post = post;
                    this.initShareLinksForSocials(id);
                    this.setBackgroundImage();
                    this.updateMetaTags(post);
                },
                error: (_) => this.router.navigate(['/not-found']),
            });
    }

    public goBack = () => this.location.back();

    private updateMetaTags(post: IPost): void {
        this.title.setTitle(post.header);
        this.meta.updateTag({ name: 'description', content: post.subHeader });
        this.meta.updateTag({ property: 'og:title', content: post.header });
        this.meta.updateTag({ property: 'og:description', content: post.subHeader });
        this.meta.updateTag({ property: 'og:image', content: post.mainPicture });
        this.meta.updateTag({ property: 'og:image:alt', content: post.header });
        this.meta.updateTag({ property: 'og:url', content: `${this.copyLink}${post.id}` });
        this.meta.updateTag({ property: 'twitter:title', content: post.header });
        this.meta.updateTag({ property: 'twitter:description', content: post.subHeader });
        this.meta.updateTag({ property: 'twitter:image', content: post.mainPicture });
    }


    public loadEnd() {
        console.log('main picture load end');
    }

    public onError() {
        let postImage = document.querySelector('post-main-picture') as HTMLElement;
        // if(postImage) { postImage.style.display = }
        console.log('picture load error');
    }
  

}
