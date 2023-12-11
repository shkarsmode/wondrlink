import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ArticleService } from './shared/services/article-service.service';
import { ImageProloaderService } from './shared/services/image-proloader.service';
import { LoadingService } from './shared/services/loading-service.service';
import { ScrollToService } from './shared/utils/scroll-to.service';
import { FlowDataService } from './shared/services/flow-data.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    public loading$: Observable<boolean>;

    constructor(
        private router: Router,
        private scrollToService: ScrollToService,
        private imageProloaderService: ImageProloaderService,
        private loadingService: LoadingService,
        private articleService: ArticleService,
        private flowDataService: FlowDataService,
    ) {
        this.loading$ = loadingService.loading$;
    }

    public ngOnInit(): void {
        this.initAllArticles();
        this.initAllFlowData();
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

    private initAllArticles(): void {
        this.articleService.setAllArticles();
    }

    private initAllFlowData() {
      this.flowDataService.setAllFlowData();
    }

    public imgs: string[] | null;
    private preloadAllBGImages(): void {
        this.loadingService.start();
        this.imgs = this.imageProloaderService.getAllBGImagesPath();
    }

    public loadedImg(): void {
        const isLoaded = this.imageProloaderService.isloadedAll();
        if (isLoaded) this.loadingService.end();
    }
}
