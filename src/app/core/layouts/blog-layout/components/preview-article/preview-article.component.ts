import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IPost } from 'src/app/shared/interfaces/IPost';

@Component({
    selector: 'app-preview-article',
    templateUrl: './preview-article.component.html',
    styleUrls: ['./preview-article.component.scss'],
})
export class PreviewArticleComponent {
    @Input() post: IPost;

    constructor(private router: Router) {}

    @HostListener('click')
    public onPostClick = () => this.router.navigate(['blog', this.post.id]);
}
