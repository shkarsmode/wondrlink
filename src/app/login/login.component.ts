import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { take } from 'rxjs';
import { ErrorLoginResponseDto } from 'src/app/shared/interfaces/ErrorLoginResponse.dto';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {

    public isShowPassword: boolean = false;
    public isShowError: boolean = false;
    public errorMessages: string[] = [];
    public recoveryEmail: string;
    public email: string;
    public password: string;
    public isLostPassword: boolean = false;
    public isCheckEmail: boolean = false;
    public recoveryToken: string | null;
    public newPassword: string;
    public repeatPassword: string;
    public isSending: boolean = false;
    public isPasswordChanged: boolean = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private jwtHelper: JwtHelperService
    ) {}

    public ngOnInit(): void {
        this.getTokenFromRoute();
    }

    private getTokenFromRoute(): void {
        this.route.queryParams.subscribe(params => {
            const token = params['recoveryToken'];
            if (!token) {
                this.recoveryToken = null;
                return;
            }

            this.recoveryToken = token;
            this.checkTokenExpiration();
        });
    }

    private checkTokenExpiration(): void {
        const token = this.recoveryToken;
        let isTokenExpired;

        try {
            isTokenExpired = !!token ? this.jwtHelper.isTokenExpired(token) : true;
        }
        catch (err) {
            // this.errorNotificationService.show('Forged token');
            this.errorMessages.push('Token is invalid');
            this.notifyAboutError();
            this.recoveryToken = '';
            return;
        }
        
        if (isTokenExpired) {
            this.errorMessages.push('Token expired');
            this.notifyAboutError();
            this.recoveryToken = '';
        }
    }
    
    public onSubmitForm(): void {
        if (this.isEmptyForm || this.isSending) return;
        
        this.isSending = true;
        this.authService.loginWithAMail(this.email, this.password)
            .pipe(take(1))
            .subscribe({
                next: this.onSuccessfulLogIn.bind(this),
                error: this.handleErrorAuthorization.bind(this)
            });
    }

    public onSubmitRecoveryForm(): void {
        if (this.isEmptyForm || this.isSending) return;

        this.isSending = true;
        this.authService.recoveryEmail(this.recoveryEmail)
            .pipe(take(1))
            .subscribe({
                next: res => {
                    console.log(res);
                    this.isCheckEmail = true;
                    this.isSending = false;
                },
                error: this.handleErrorAuthorization.bind(this)
            });
    }

    public onSubmitNewPasswordForm(): void {
        if (this.isValidNewPasswordForm || !this.recoveryToken || this.isSending) return;

        this.isSending = true;
        this.authService.updatePassword(this.newPassword, this.recoveryToken)
            .pipe(take(1))
            .subscribe({
                next: res => {
                    this.isSending = false;
                    this.isPasswordChanged = true;
                },
                error: this.handleErrorAuthorization.bind(this)
            });
    }

    public toggleLostPasswordFlow(): void {
        this.isLostPassword = !this.isLostPassword;
        this.isShowError = false;
        this.errorMessages = [];
    }

    private onSuccessfulLogIn(): void {
        this.errorMessages = [];
        this.isSending = false;

        if (this.authService.isAdmin) {
            this.router.navigate(['/admin']);
            return;
        }

        this.router.navigate(['/']);
    }

    private handleErrorAuthorization(error: ErrorLoginResponseDto): void {
        this.errorMessages = [];
        if (typeof error.message === 'string') {
            this.errorMessages.push(error.message);
        } else {
            this.errorMessages = error.message;
        }
        
        this.isShowError = true;
        this.isSending = false;
    }

    private get isValidNewPasswordForm(): boolean {
        this.errorMessages = [];

        if (!this.newPassword) this.errorMessages.push('Please enter a new password');
        if (!this.repeatPassword) this.errorMessages.push('Please repeat a new password');

        if (!this.newPassword || !this.repeatPassword) {
            this.notifyAboutError();
            return true;
        }

        if (this.newPassword !== this.repeatPassword) {
            this.errorMessages.push('Passwords must match!');

            this.notifyAboutError();
            return true;
        }
        
        return false;
    }


    private get isEmptyForm(): boolean {
        this.errorMessages = [];

        if (this.isLostPassword) {
            if (!this.recoveryEmail) {
                this.errorMessages.push('Please enter a email');
                this.notifyAboutError();
                return true;
            }

            return false;
        }

        if (!this.email) this.errorMessages.push('Please enter a email');
        if (!this.password) this.errorMessages.push('Please enter a password');

        if (!this.password || !this.email) {
            this.notifyAboutError();
            return true;
        }
        
        return false;
    }

    private async notifyAboutError(): Promise<void> {
        this.isShowError = true;
        await new Promise(resolve => setTimeout(resolve, 300));
        this.isShowError = false;
    }

    public toggleShowingPassword = () => this.isShowPassword = !this.isShowPassword;

}
