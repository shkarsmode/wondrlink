import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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
                    this.login(response.token);
                    return response;
                }));
    }

    public login(token: string): void {
        this.storageService.set('token', token);
        const role = this.getUserRoleFromToken(token);
        const id = this.getUserIdFromToken(token);

        if (role) this.storageService.set('role', role);
        if (id) this.userId = id;
        
        this.isAuthenticatedSubject.next(true);
        this.checkTokenExpiration();
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
        this.storageService.remove('role');
        this.userId = null;
        this.isAuthenticatedSubject.next(false);
    }

    private checkTokenExpiration(): void {
        const token = this.storageService.get('token') as string;
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
