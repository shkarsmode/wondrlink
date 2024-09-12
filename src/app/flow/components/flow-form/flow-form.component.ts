import { specialityData } from './../../../../assets/data/flow-data/specialization.data';
import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    Optional,
    Output,
    QueryList,
    Renderer2,
    ViewChildren,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
    MatDialog,
    MatDialogConfig,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, last, startWith } from 'rxjs';
import { CheckEmailComponent } from 'src/app/shared/dialogs/check-email/check-email.component';
import { ICountryCodes } from 'src/app/shared/interfaces/ICountryCodes';
import { TFormFlow } from 'src/app/shared/interfaces/TFormFlow';
import { ArticleService } from 'src/app/shared/services/article-service.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CountryCodesService } from 'src/app/shared/services/country-codes.service';
import { FlowDataService } from 'src/app/shared/services/flow-data.service';
import { FlowData } from '../../flow.component';
import { FlowDialogComponent } from '../flow-dialog/flow-dialog.component';
import { AFFILIATION_DATA } from 'src/app/shared/tokens/affiliation-data.token';
import { IAffiliationData } from 'src/app/shared/interfaces/AffiliationData.type';
import { SPECIALITY_DATA } from 'src/app/shared/tokens/speciality-data.token';
import { ISpecialityData } from 'src/app/shared/interfaces/SpecialityData.type';
import { matchFlowUserType } from 'src/app/shared/features/matchFlowUserType.helper';

@Component({
    selector: 'app-flow-form',
    templateUrl: './flow-form.component.html',
    styleUrls: ['./flow-form.component.scss'],
})
export class FlowFormComponent {
    @Input() public formType: TFormFlow = 'patients';
    @Output() public next = new EventEmitter<FlowData>();
    @Input() public flowData: FlowData[];

    @ViewChildren('formInput') formInputs: QueryList<ElementRef>;

    public contactForm: FormGroup;

    public isMySelf: boolean = true; // switcher patients form

    // set up default placeholder styles for select element
    public isFunctionPlaceholder = true;
    public isAffiliationPlaceholder = true;
    public isSpecialityPlaceholder = true;

    // for function input field 
    public functionInputData: string[] = [];

    public isSending: boolean = false; // when form is submiting

    // untill back will done we generate a password manually
    private password: any = 'test' + Math.floor(Math.random() * 100) + 1;

    // for detecting when user change flow and apply appropirate form for him
    private oldFormType: TFormFlow;

    // when user submits a form, it will show him the check email dialog
    private dialogConfig: MatDialogConfig = new MatDialogConfig();

    constructor(
        private authService: AuthService,
        private fb: FormBuilder,
        private dialog: MatDialog,
        private errorSnackBar: MatSnackBar,
        private flowDataService: FlowDataService,
        private articleService: ArticleService,
        private renderer: Renderer2,
        @Inject(AFFILIATION_DATA) public affiliationData: IAffiliationData,
        @Inject(SPECIALITY_DATA) public specialityData: ISpecialityData,
        @Optional() private dialogRef: MatDialogRef<FlowDialogComponent>
    ) {}

    ngOnInit(): void {
        this.initContactForm();
        this.initDialogConfig();
        this.initFunctionInputData(); // data for select in flow 
        this.oldFormType = this.formType; // just for matching the form
    }

    ngDoCheck(): void {
        // detects when user change the flow and then reinits FormBuilder to gather correct field coresponding to form-flow type
        if (this.oldFormType === this.formType) return;
        if (this.oldFormType !== this.formType) {
            this.oldFormType = this.formType;
            this.initContactForm();
        }
    }

    ngAfterViewInit(): void {
        this.initTabindexOrder();

        this.contactForm.valueChanges.subscribe(el => {
            console.log(el);
        })
    }

    private initContactForm(): void {
        switch (this.formType) {
            case 'patients': {
                this.contactForm = this.fb.group({
                    firstName: [''],
                    lastName: [''],
                    phone: [''],
                    email: ['', Validators.email],
                    location: ['', Validators.required],
                });
                break;
            }
            case 'physicians': {
                this.contactForm = this.fb.group({
                    firstName: [''],
                    lastName: [''],
                    phone: [''],
                    email: ['', Validators.email],
                    location: ['', Validators.required],
                    speciality: ['', Validators.required],
                    affiliation: ['', Validators.required],
                    companyName: [''],
                    license: ['', Validators.required],
                });
                break;
            }
            case 'ecosystem': {

                if(this.isAffilationForEcosystem()) {
                    this.contactForm = this.fb.group({
                        companyName: [''],
                        firstName: [''],
                        lastName: [''],
                        function: ['', Validators.required],
                        affiliation: ['', Validators.required],
                        phone: [''],
                        email: ['', Validators.email],
                        location: ['', Validators.required],
                    });        
                } else {
                    this.contactForm = this.fb.group({
                        companyName: [''],
                        firstName: [''],
                        lastName: [''],
                        function: ['', Validators.required],
                        position: ['', Validators.required],
                        phone: [''],
                        email: ['', Validators.email],
                        location: ['', Validators.required],
                    });
                }
             
                break;
            }
            default: {
                this.contactForm = this.fb.group({
                    companyName: [''],
                    firstName: [''],
                    lastName: [''],
                    function: ['', Validators.required],
                    position: ['', Validators.required],
                    phone: [''],
                    email: ['', Validators.email],
                    location: ['', Validators.required],
                });
                break;
            }
        }
    }

    private initTabindexOrder(): void {
        this.formInputs.forEach((input, i) => {
            let index = (i + 1).toString();
            this.renderer.setAttribute(input.nativeElement, 'tabindex', index);
        });
    }

    public initFunctionInputData() {
        if(this.formType === 'patients') return; 
        if(this.formType === 'physicians') return; 
        
        this.functionInputData = this.flowDataService
            .getSubgroupFunctionByTitle(this.flowData[2].companyType!);
    }

    // for Patients Sign up mySelf/forOther before changes
    // now it's for Patient/Caregiver
    public chooseSigningUpFor(isMySelf: boolean): void {
        this.isMySelf = isMySelf; 
    }

    public deactiveFunctionSelectPlaceholder(): void {
        if (!this.isFunctionPlaceholder) return;
        this.isFunctionPlaceholder = false;
    }

    public deactiveAffiliationSelectPlaceholder(): void {
        if(!this.isAffiliationPlaceholder) return;
        this.isAffiliationPlaceholder = false;
    }

    public deactiveSpecialitySelectPlaceholder(): void {
        if(!this.isSpecialityPlaceholder) return;
        this.isSpecialityPlaceholder = false;
    }


    public isAffilationForEcosystem(): boolean {
        return this.formType == 'ecosystem' && this.flowData[2].companyType == "Patient Support"
    }

    // for patiensts flow
    public onNextStep(): void {
        let currentIsMySelft = this.isMySelf;
        let password = this.password;
        let phone = this.phone.value
        // let lastName = "Removed";
                
        let flowData = Object.assign(
            this.contactForm.value, {
            isMySelf: currentIsMySelft,
            password: password,
            phone: phone,
            // lastName: lastName
        });

        console.log(flowData);

        this.next.emit(flowData);
    }



    public onContactFormSubmit(): void {
        this.isSending = true;

        // we register a user for sending a letter
        // now registration unneeded
        // but we still have to send password for correct back-end working

        let password = this.password;
        let phone = this.phone.value

        let body; 
        if(this.formType === 'physicians') {
            body = Object.assign(
                this.contactForm.value,
                { password: password,
                  phone: phone,
                  type: matchFlowUserType(this.formType)
                },
                this.convertLicense(),
            );
            delete body.license;
        } else {
            body = Object.assign(
                this.contactForm.value,
                ...this.flowData,
                { password: password,
                  phone: phone,
                },
            );
        }
      
        this.authService.registration(body).subscribe({
            next: (res) => {
                console.log(res);
                this.isSending = false;
                this.openCheckEmailModalWindow();
            },
            error: (error) => {
                console.log(error.message);
                this.errorSnackBar.open(error.message, 'Close', {
                    duration: 10000,
                    verticalPosition: 'top',
                });
                this.isSending = false;
            },
        });
    }

 
    private convertLicense(): {[key in 'isMySelf']?: boolean} {
        let license = this.contactForm.get('license');
        if(license) return { 'isMySelf': license.value === "true" }
        else return {}
    }


    // for other flows
    private initDialogConfig(): void {
        this.dialogConfig.width = '850px';
        this.dialogConfig.disableClose = true;
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

    private get phone(): FormControl { return this.contactForm.get('phone') as FormControl; }

    public onPhoneValidityChange(isValid: boolean): void {
        if(isValid) this.phone.setErrors(null)
        else this.phone.setErrors({ phoneInvalid: true});
    }
  
}
