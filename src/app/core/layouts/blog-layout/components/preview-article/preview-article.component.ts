import { Component, Input } from '@angular/core';
import { IPost } from 'src/interfaces/IPost';

@Component({
    selector: 'app-preview-article',
    templateUrl: './preview-article.component.html',
    styleUrls: ['./preview-article.component.scss']
})
export class PreviewArticleComponent {

    @Input() post: IPost;

    public onPostClick(): void {
        console.log(this.post.id);
    }
}
