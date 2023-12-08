import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-blog-navigation',
    templateUrl: './blog-navigation.component.html',
    styleUrls: ['./blog-navigation.component.scss']
})
export class BlogNavigationComponent {
    @Input() public page: number;
    @Input() public pagesCount: number;

    @Output() public back: EventEmitter<void> = new EventEmitter();
    @Output() public forward: EventEmitter<void> = new EventEmitter();
    @Output() public loadMore: EventEmitter<void> = new EventEmitter();

    public onBackButtonClick = () => this.back.emit();
    public onForwardButtonClick = () => this.forward.emit();
    public onButtonMoreClick = () => this.loadMore.emit();
}
