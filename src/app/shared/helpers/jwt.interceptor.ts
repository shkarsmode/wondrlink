import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { GEO_PATH_API } from '../services/variables';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthService,
        @Inject(GEO_PATH_API) private geoApiPath: string
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.token;
    
        if (token && !request.url.includes(this.geoApiPath)) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }
    
        return next.handle(request);
    }
}
