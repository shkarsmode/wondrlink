import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-article-intro',
  templateUrl: './article-intro.component.html',
  styleUrl: './article-intro.component.scss'
})
export class ArticleIntroComponent {
  @Input() text: string = "";
}
