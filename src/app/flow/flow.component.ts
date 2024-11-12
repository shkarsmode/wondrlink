import { HttpClient } from '@angular/common/http';
import { Component, Input, Optional } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { first } from 'rxjs';
import { CheckEmailComponent } from '../shared/dialogs/check-email/check-email.component';
import { matchFlowUserType } from '../shared/features/matchFlowUserType.helper';
import { TFormFlow } from '../shared/interfaces/TFormFlow';
import { ArticleService } from '../shared/services/article-service.service';
import { AuthService } from '../shared/services/auth.service';
import { FlowDialogComponent } from './components/flow-dialog/flow-dialog.component';

export type TUserType =
    | 'Patient'
    | 'Ecosystem'
    | 'Drug Developers'
    | 'Physician';

export interface FlowData {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    companyName?: string;
    companyType?: string;
    patientSituationType?: string;
    diseaseCategory?: string;
    cancerType?: string;
    diseaseDetails?: string;
    location?: string;
    isMySelf?: boolean;
    type?: TUserType;
}

@Component({
    selector: 'app-flow',
    templateUrl: './flow.component.html',
    styleUrls: ['./flow.component.scss'],
})
export class FlowComponent {
    @Input() flow: TFormFlow = 'patients';
    @Input() step: number = 1;
    @Input() isSkipFirstStep: boolean = false;

    public flowData: FlowData[] = [];
    private dialogConfig: MatDialogConfig = new MatDialogConfig();

    constructor(
        private readonly http: HttpClient,
        private authService: AuthService,
        private dialog: MatDialog,
        private errorSnackBar: MatSnackBar,
        private articleService: ArticleService,
        @Optional() private dialogRef: MatDialogRef<FlowDialogComponent>
    ) {}

    public formsData: any;
    public ngOnInit(): void {
        this.initFormFlowDataFirstStep(this.flow);
        this.initDialogConfig();

        this.http
            .get('/assets/data/all-forms-data.json')
            .pipe(first())
            .subscribe((formsData) => (this.formsData = formsData));
    }

    public onContactFormSubmit(result: {
        [key: string]: { value: string; label: string };
    }): void {
        // this.isSending = true;

        // we register a user for sending a letter
        // now registration unneeded
        // but we still have to send password for correct back-end working

        const body = {
            additionalInfo: result,
            fullName: result['fullName'].value,
            email: result['email'].value,
            type: result['organizationType'].value,
        };

        console.log(body);
        this.authService.registration(body).subscribe({
            next: (res) => {
                console.log(res);
                // this.isSending = false;
                this.openCheckEmailModalWindow();
            },
            error: (error) => {
                console.log(error.message);
                this.errorSnackBar.open(error.message, 'Close', {
                    duration: 10000,
                    verticalPosition: 'top',
                });
                // this.isSending = false;
            },
        });
    }

    public openCheckEmailModalWindow(): void {
        this.dialog.open(CheckEmailComponent, this.dialogConfig);
        this.dialog.afterAllClosed.subscribe(() =>
            this.articleService.reinitArticleForm()
        );
        // Check if FlowDialogComponent is open as a MatDialog before attempting to close it
        if (this.dialogRef && this.dialogRef.componentInstance) {
            this.dialogRef.close();
        }
    }

    private initDialogConfig(): void {
        this.dialogConfig.width = '850px';
        this.dialogConfig.disableClose = true;
    }

    public onFlowChange(newFlow: TFormFlow) {
        this.flow = newFlow;
    }

    public onStepBack(): void {
        this.step--;
        this.flowData.pop();
        this.scrollToTop();
    }

    public onNextStep(flowData: FlowData) {
        if (flowData) {
            this.flowData[this.step] = flowData;
            this.step++;
            this.scrollToTop();
        }
    }

    private scrollToTop(): void {
        document.querySelector('app-flow-dialog .wrap')?.scroll(0, 0);
    }

    private initFormFlowDataFirstStep(flow: TFormFlow) {
        if (!this.isSkipFirstStep) return;
        let flowType = matchFlowUserType(flow);
        this.flowData[1] = {
            type: flowType,
        };
    }
}
