import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';

@Component({
    selector: 'app-quotes',
    templateUrl: './quotes.component.html',
    styleUrls: ['./quotes.component.scss']
})
export class QuotesComponent implements AfterViewInit {

    public activeIndex: number = 0;
    public domQuotes: Array<ElementRef>;
    @ViewChildren('quote1, quote2, quote3') quotes: QueryList<ElementRef>;

    public ngAfterViewInit(): void {
        this.convertQuotesQueryListToArray();
    }

    public isMouseDown: boolean = false;
    private firstSreenX: number = 0;
    private diffFirstSreenX: number = 0;

    public onMouseDown(event: any): void {
        this.isMouseDown = true;
        this.firstSreenX = this.getScreenX(event);
    }

    public onMouseMove(event: any, index: number): void {
        if (this.isMouseDown) {
            const offsetX = this.getScreenX(event) - this.firstSreenX;

            this.domQuotes.forEach((quote, i) => {
                quote.nativeElement.style.transition = 'unset';
                if (index == 0 && i == 2 || index == 2 && i == 0) return;
                quote.nativeElement.style.transform = `translateX(${offsetX}px)`;
            });

            this.diffFirstSreenX = offsetX;
        } else {
            this.isMouseDown = false;
        }
    }

    public onMouseUp(): void {
        if (!this.isMouseDown) return;

        if (this.diffFirstSreenX > 150 && this.activeIndex > 0) this.activeIndex--;
        if (this.diffFirstSreenX < -150 && this.activeIndex < 2) this.activeIndex++;

        this.domQuotes.forEach(quote => {
            quote.nativeElement.style.transition = 'all .7s';
            quote.nativeElement.style.transform = 'unset';
        });

        this.isMouseDown = false;
    }

    public onTouchMove = (event: any, index: number) => this.onMouseMove(event, index);
    
    public onTouchEnd = () => this.onMouseUp();
    
    public chooseQuoteByIndex(index: number): void {
        this.activeIndex = index;
    }

    private getScreenX(event: any): number {
        if (event.touches && event.touches.length > 0) {
            return event.touches[0].screenX;
        }
        return event.screenX;
    }

    public convertQuotesQueryListToArray = () => this.domQuotes = this.quotes.toArray();
}
