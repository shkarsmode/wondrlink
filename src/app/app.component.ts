import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ImageProloaderService } from './shared/services/image-proloader.service';
import { ScrollToService } from './shared/utils/scroll-to.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    constructor(
        private router: Router,
        private scrollToService: ScrollToService,
        private imageProloaderService: ImageProloaderService
    ) {}

    public ngOnInit(): void {
        this.listenRoutesTransition();
        this.preloadAllBGImages();
    }

    private async listenRoutesTransition(): Promise<void> {
        this.router.events.subscribe(async event=> {
            if (event instanceof NavigationEnd) {
                await new Promise(resolve => setTimeout(resolve, 50));
                this.scrollToService.scrollToTop();
            }
        });
        
    }

    public imgs: string[] | null;
    private preloadAllBGImages(): void {
        this.imgs = this.imageProloaderService.getAllBGImagesPath();
    }

    public loadedImg(): void {
        this.imageProloaderService.loaded();
    }
}
