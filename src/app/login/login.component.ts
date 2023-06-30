import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}
    
    public onSubmitForm(): void {
        if (this.isEmptyForm) return;
        
        this.authService.loginWithAMail(this.email, this.password)
            .pipe(take(1))
            .subscribe({
                next: this.onSuccessfulLogIn.bind(this),
                error: this.handleErrorAuthorization.bind(this)
            });
    }

    public onSubmitRecoveryForm(): void {
        if (this.isEmptyForm) return;
        this.authService.recoveryEmail(this.email)
            .pipe(take(1))
            .subscribe({
                next: res => console.log(res),
                error: () => {}
            });
    }

    public toggleLostPasswordFlow(): void {
        this.isLostPassword = !this.isLostPassword;
        this.isShowError = false;
        this.errorMessages = [];
    }

    private onSuccessfulLogIn(): void {
        this.errorMessages = [];

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
