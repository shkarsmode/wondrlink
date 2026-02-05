import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, catchError, Observable, switchMap, tap, throwError } from 'rxjs';
import { ErrorLoginResponseDto } from 'src/app/shared/interfaces/ErrorLoginResponse.dto';
import { UserRoleEnum } from 'src/app/shared/interfaces/UserRoleEnum';
import { StorageService } from './storage-service.service';
import { AUTH_PATH_API } from './variables';
// import { ErrorNotificationService } from '../../shared/error-notification.service';
// import { AUTH_PATH_API } from '../../variables';

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    private authPathApi: string;
    private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private isRefreshing = false;

    public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();
    public userId: number | null;

    private storageService: StorageService = inject(StorageService);
    
    constructor(
        private jwtHelper: JwtHelperService,
        private http: HttpClient,
        private jwt: JwtHelperService,
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

    public updatePassword(password: string, token: string): Observable<any> {
        const headers = new HttpHeaders().set('token', token); // Set the 'token' header

        return this.http.post<any>(
            `${this.authPathApi}/updatePassword`,
            { password },
            { headers }
        );
    }

    public recoveryEmail(email: string): Observable<any | ErrorLoginResponseDto> {
        return this.http.post<any>(
            `${this.authPathApi}/recoveryWithEmail`, 
            { email}
        );
    }

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
                    this.login(response.token, response.refreshToken);
                    return response;
                }));
    }

    public login(token: string, refreshToken?: string): void {
        this.storageService.set('token', token);
        if (refreshToken) {
            this.storageService.set('refreshToken', refreshToken);
        }
        const role = this.getUserRoleFromToken(token);
        const id = this.getUserIdFromToken(token);

        if (role) this.storageService.set('role', role);
        if (id) this.userId = id;
        
        this.isAuthenticatedSubject.next(true);
        this.checkTokenExpiration();
    }

    public refreshToken(): Observable<any> {
        const refreshToken = this.storageService.get('refreshToken');
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token'));
        }

        if (this.isRefreshing) {
            // Wait for the current refresh to complete instead of erroring
            return new Observable(observer => {
                const checkInterval = setInterval(() => {
                    if (!this.isRefreshing) {
                        clearInterval(checkInterval);
                        const token = this.storageService.get('token');
                        if (token) {
                            observer.next({ token });
                            observer.complete();
                        } else {
                            observer.error(new Error('Refresh failed'));
                        }
                    }
                }, 100);
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    observer.error(new Error('Refresh timeout'));
                }, 10000);
            });
        }

        this.isRefreshing = true;
        return this.http.post<any>(`${this.authPathApi}/refresh`, { refreshToken }).pipe(
            tap((response: any) => {
                this.isRefreshing = false;
                this.login(response.token, response.refreshToken);
            }),
            catchError((error) => {
                this.isRefreshing = false;
                this.logout();
                return throwError(() => error);
            })
        );
    }

    public tryRefreshToken(): Observable<boolean> {
        return this.refreshToken().pipe(
            switchMap(() => {
                return new Observable<boolean>(observer => {
                    observer.next(true);
                    observer.complete();
                });
            }),
            catchError(() => {
                return new Observable<boolean>(observer => {
                    observer.next(false);
                    observer.complete();
                });
            })
        );
    }

    public registration(body: any): Observable<any> {
        return this.http.post(`${this.authPathApi}/registration`, body);
    }

    public approveUserProfile(token: string): Observable<any> {
        return this.http.get(`${this.authPathApi}/approve?token=${token}`);
    }

    public getUserIdFromToken(token: string): number | null {
        try {
            const decodedToken = this.jwt.decodeToken(token);
            const id = decodedToken?.id;
            if (id) return id;

            return null;
        } catch(e) {
            return null;
        }
    }

    private getUserRoleFromToken(token: string): UserRoleEnum | null {
        try {
            const decodedToken = this.jwt.decodeToken(token);
            const role = decodedToken?.role as UserRoleEnum;
            if (role) return role;

            return null;
        } catch(e) {
            return null;
        }
    }

    public logout(): void {
        this.storageService.remove('token');
        this.storageService.remove('refreshToken');
        this.storageService.remove('role');
        this.userId = null;
        this.isAuthenticatedSubject.next(false);
    }

    private checkTokenExpiration(): void {
        const token = this.storageService.get('token') as string;
        const refreshToken = this.storageService.get('refreshToken') as string;
        
        if (!token) {
            return; // No token, nothing to check
        }

        let isTokenExpired;
        try {
            isTokenExpired = this.jwtHelper.isTokenExpired(token);
        }
        catch (err) {
            // this.errorNotificationService.show('Forged token');
            this.logout();
            return;
        }
        
        if (isTokenExpired) {
            // Try to refresh if we have a refresh token
            if (refreshToken) {
                try {
                    const isRefreshExpired = this.jwtHelper.isTokenExpired(refreshToken);
                    if (isRefreshExpired) {
                        this.logout();
                        return;
                    }
                } catch {
                    this.logout();
                    return;
                }
                
                this.refreshToken().subscribe({
                    error: () => this.logout()
                });
            } else {
                this.logout();
            }
        }
    }

    private initializeAuth(): void {
        const token = this.storageService.get('token');
        const isAuthenticated = !!token && !this.jwtHelper.isTokenExpired(token);
        this.isAuthenticatedSubject.next(isAuthenticated);
    }

    public get token(): string | null {
        const token = this.storageService.get('token');
        return token;
    }

    public get isAdmin(): boolean {
        const role = this.storageService.get('role') as UserRoleEnum;
        return role === UserRoleEnum.ADMIN;
    }

    public sendVerificationCode(phone: number): Observable<any> {
        return this.http.post(`${this.authPathApi}/phone/send`, { phone });
    }

    public verifyPhoneCode(phone: number, code: string): Observable<{ success: boolean }> {
        return this.http.post<{ success: boolean }>(
            `${this.authPathApi}/phone/verify`, 
            { phone, code }
        );
    }
}
