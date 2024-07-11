import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
// import { ErrorNotificationService } from '../services/shared/error-notification.service';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    private readonly errorCodesForNotification: number[] = [400, 401, 403, 404, 500, 503];

    constructor(
        private authService: AuthService,
        private router: Router,
        // private errorNotificationService: ErrorNotificationService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                // let errorMessage = 'An error occurred';
                // if (error.error instanceof ErrorEvent) {
                //     // Client-side error
                //     errorMessage = `Error: ${error.error.message}`;
                // } else {
                //     // Server-side error
                //     errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
                // }

                // Notification for user
                const isCatchingError = this.errorCodesForNotification.includes(error.status);
                // if (isCatchingError) this.errorNotificationService.show(error.status);

                if (error.status === 401) {
                    this.authService.logout();
                    this.router.navigate(['/home']);
                }
                
                return throwError(() => error.error);
            })
        );
    }
}
