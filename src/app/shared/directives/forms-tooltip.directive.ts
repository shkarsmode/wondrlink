import { Directive, ElementRef, HostListener, inject, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[tooltipText]',
    standalone: true,
})
export class FormsTooltipDirective implements OnInit {
    @Input() public tooltipText: string;

    private readonly elementRef: ElementRef = inject(ElementRef);

    public ngOnInit(): void {
        this.setTooltipElementWithText();
    }

    @HostListener('click', ['$event'])
    public ngOnMouseEnter(event: MouseEvent): void {
        alert(this.tooltipText);
    }

    @HostListener('mouseleave')
    public ngOnMouseLeave(): void {
    }

    private setTooltipElementWithText(): void {
        if (!this.tooltipText) return;
        
    }
}
