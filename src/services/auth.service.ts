import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ErrorLoginResponseDto } from 'src/interfaces/ErrorLoginResponse.dto';
import { AUTH_PATH_API } from './variables';
// import { ErrorNotificationService } from '../../shared/error-notification.service';
// import { AUTH_PATH_API } from '../../variables';

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    private authPathApi: string;
    private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();
    
    constructor(
        private jwtHelper: JwtHelperService,
        private http: HttpClient,
        // private errorNotificationService: ErrorNotificationService,
        @Inject(AUTH_PATH_API) authPathApi: string
    ) {
        if (authPathApi) this.authPathApi = authPathApi;
        this.checkTokenExpiration();
        this.initializeAuth();
    }


    // public registerWithAMail(
    //     email: string,
    //     userName: string,
    //     password: string,
    //     confirmPassword: string
    // ): Observable<RegisterResponseDto> {
    //     return this.http.post<RegisterResponseDto>(
    //         `${this.authPathApi}/register`,
    //         {
    //             email, 
    //             userName,
    //             password, 
    //             confirmPassword
    //         }).pipe(tap((response: any) => {
    //             this.login(response.token);
    //             return response;
    //         }));
    // }

    public loginWithAMail(
        email: string,
        password: string,
    ): Observable<any | ErrorLoginResponseDto> {
        return this.http.post<any>(
            `${this.authPathApi}/login`,
            {
                email: email,
                password, 
            }).pipe(
                tap((response: any) => {
                    this.login(response.token);
                    return response;
                }));
    }

    public login(token: string): void {
        localStorage.setItem('token', token);
        this.isAuthenticatedSubject.next(true);
        this.checkTokenExpiration();
    }

    public logout(): void {
        localStorage.removeItem('token');
        this.isAuthenticatedSubject.next(false);
    }

    private checkTokenExpiration(): void {
        const token = localStorage.getItem('token') as string;
        let isTokenExpired;

        try {
            isTokenExpired = !!token ? this.jwtHelper.isTokenExpired(token) : true;
        }
        catch (err) {
            // this.errorNotificationService.show('Forged token');
            this.logout();
            return;
        }
        
        if (isTokenExpired) {
            this.logout();
        }
    }

    private initializeAuth(): void {
        const token = localStorage.getItem('token');
        const isAuthenticated = !!token && !this.jwtHelper.isTokenExpired(token);
        this.isAuthenticatedSubject.next(isAuthenticated);
    }

    public get token(): string | null {
        const token = localStorage.getItem('token');
        return token;
    }
}
