import { Component, HostListener, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ScrollToService } from 'src/utils/scroll-to.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    public isHeaderOut: boolean = false;
    public isHeaderIn: boolean = false;
    public isAuthenticated$: Observable<boolean>;
    public isLoggingOut: boolean = false;
    public isAdmin: boolean;

    private previousValue: number = 0;


    constructor(
        private scrollTo: ScrollToService,
        private authService: AuthService
    ) {}

    public ngOnInit(): void {
        this.initAuthenticatedStreamAndSetRole();
    }

    private initAuthenticatedStreamAndSetRole(): void {
        this.isAuthenticated$ = this.authService.isAuthenticated$;
        this.isAdmin = this.authService.isAdmin;
    }

    public async logout(): Promise<void> {
        this.isLoggingOut = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.isLoggingOut = false;
        
        this.authService.logout();
    }

    @HostListener('window:scroll', ['$event'])
    public onWindowScroll(): void {
        const scrollTop = (window.pageYOffset !== undefined) ? 
            window.pageYOffset : 
            (document.documentElement || 
                document.body.parentNode || 
                document.body as any).scrollTop;
    
		this.isHeaderOut = scrollTop > 50 ? true : false;
        this.isHeaderIn = 
            this.previousValue > scrollTop && 
            scrollTop > 50 ? true : false;
        
        this.previousValue = scrollTop;
    }

    public scrollToElement(name: string): void {
        const existingComponents = [
            'app-about-us',
            'app-contact-us',
        ];
        const selector = existingComponents.find(component => component.includes(name)) as string;

        this.scrollTo.scroll(selector, 1000);
    }
}
