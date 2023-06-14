import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ScrollToService } from './shared/utils/scroll-to.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(
        private router: Router,
        private scrollToService: ScrollToService
    ) {}

    public ngOnInit(): void {
        this.listenRoutesTransition();
    }

    private async listenRoutesTransition(): Promise<void> {
        this.router.events.subscribe(async event=> {
            if (event instanceof NavigationEnd) {
                await new Promise(resolve => setTimeout(resolve, 50));
                this.scrollToService.scrollToTop();
            }
        });
        
    }
}
