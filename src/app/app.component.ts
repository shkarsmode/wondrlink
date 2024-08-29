import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ArticleService } from './shared/services/article-service.service';
import { CountryCodesService } from './shared/services/country-codes.service';
import { FlowDataService } from './shared/services/flow-data.service';
import { ImageProloaderService } from './shared/services/image-proloader.service';
import { LoadingService } from './shared/services/loading-service.service';
import { ScrollToService } from './shared/utils/scroll-to.service';

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
        private countryCodesService: CountryCodesService,
    ) {
        this.loading$ = loadingService.loading$;
        // setTimeout(() => loadingService.start(), 800);
    }

    public ngOnInit(): void {
        this.initAllArticles();
        this.initAllFlowData();
        this.initAllCountryCodesData();
        this.listenRoutesTransition();
        this.preloadAllBGImages();
    }

    private async listenRoutesTransition(): Promise<void> {
        this.router.events.subscribe(async event => {
            if (event instanceof NavigationEnd) {
                await new Promise(resolve => setTimeout(resolve, 50));
              
                this.updateHeaderNavByPage(event);
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

    private initAllCountryCodesData() {
        this.countryCodesService.setAllCountyCodes();
        console.log(this.countryCodesService.getCountryCodes())
    }

    public imgs: string[] | null;
    public materialSymbols: string[] | null;
    private preloadAllBGImages(): void {
        this.loadingService.start();
        this.imgs = this.imageProloaderService.getAllBGImagesPath();
        this.materialSymbols = this.imageProloaderService.getAllMaterialSymbols();
    }

    public loadedImg(): void {
        const isLoaded = this.imageProloaderService.isloadedAll();
        if (isLoaded) this.loadingService.end();
    }

    private updateHeaderNavByPage(event: NavigationEnd): void {
        let params = event.url.split('/');
        Array.from(document.querySelectorAll('li')).forEach(
            li => {
                // current page = one of the navigation list
                if (li.getAttribute('routerLink') === params[1]) {
                    li.style.fontWeight = "800";
                } 
                // if home page 
                else if(li.getAttribute('routerLink') === '/' && params[1] == '') {
                    li.style.fontWeight = "800";
                }
                else { 
                    li.style.fontWeight = "400";
                } 
            });
    }

}
