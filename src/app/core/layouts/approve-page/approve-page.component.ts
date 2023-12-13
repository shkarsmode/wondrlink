import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { IUser } from 'src/app/shared/interfaces/IUser';
import { ApprovalService } from 'src/app/shared/services/approval.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
    selector: 'app-approve-page',
    templateUrl: './approve-page.component.html',
    styleUrls: ['./approve-page.component.scss']
})
export class ApprovePageComponent implements OnInit {

    public isLoading: boolean = true;
    public isStatusOk: boolean = false;
    public token: string | null;
    public user: IUser;
    public errorMessage: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private approvalService: ApprovalService
    ) {}

    public ngOnInit(): void {
        this.getInfoOfRouteAndValidate();
    }

    private getInfoOfRouteAndValidate(): void {
        this.route.queryParams.subscribe(params => {
            this.token = params['token'];
            this.candidateValidationApprovalToken();
        });
    }


    private candidateValidationApprovalToken(): void {
         if (!this.token) {
            this.isStatusOk = false;
            this.isLoading = false;
            return;
        }

        this.authService.approveUserProfile(this.token)
            .subscribe({
                next: user => {
                    this.user = user;
                    this.approvalService.accessApprovedDialog(true);

                    const navigationExtras: NavigationExtras = {
                        replaceUrl: true
                    }

                    this.router.navigate([''], navigationExtras);

                    // this.isStatusOk = true;
                    this.isLoading = false;
                },
                error: err => {
                    this.errorMessage = err.message;
                    this.isStatusOk = false;
                    this.isLoading = false;
                }
            });
    }
}
