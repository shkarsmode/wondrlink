import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
// import { ErrorNotificationService } from '../services/shared/error-notification.service';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    private readonly errorCodesForNotification: number[] = [400, 401, 403, 404, 500, 503];
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

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

                if (error.status === 401 && !request.url.includes('/refresh')) {
                    return this.handle401Error(request, next);
                }
                
                return throwError(() => error.error);
            })
        );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshToken().pipe(
                switchMap((tokens: any) => {
                    this.isRefreshing = false;
                    this.refreshTokenSubject.next(tokens.token);
                    return next.handle(this.addTokenHeader(request, tokens.token));
                }),
                catchError((err) => {
                    this.isRefreshing = false;
                    this.authService.logout();
                    this.router.navigate(['/home']);
                    return throwError(() => err);
                })
            );
        }

        return this.refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => next.handle(this.addTokenHeader(request, token)))
        );
    }

    private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }
}
