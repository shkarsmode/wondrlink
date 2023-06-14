import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot
} from '@angular/router';
import { Observable, tap } from 'rxjs';
// import { ErrorNotificationService } from '../services/shared/error-notification.service';
import { AuthService } from 'src/app/shared/services/auth.service';


@Injectable({
    providedIn: 'root',
})
export class AuthGuard {

    // TODO: add ROLE guard on angular and nestjs

    constructor(
        private authService: AuthService, 
        private router: Router,
        // private errorNotificationService: ErrorNotificationService
    ) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        
        if (!this.authService.isAdmin) {
            this.router.navigate(['/login'], {
                queryParams: { returnUrl: 'not-authenticated' },
            });
            return false;
        }

        return this.authService.isAuthenticated$.pipe(
            tap(isAuthenticated => {
                if (!isAuthenticated) {
                    // this.errorNotificationService.show(401);
                    
                    this.router.navigate(['/login'], {
                        queryParams: { returnUrl: 'not-authenticated' },
                    });
                }
            })
        );
    }
}
