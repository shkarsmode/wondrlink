import { Component, Input, Output, EventEmitter, Optional, ViewChildren, QueryList, ElementRef, Renderer2, asNativeElements } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { CheckEmailComponent } from 'src/app/shared/dialogs/check-email/check-email.component';
import { TFLow } from 'src/app/shared/interfaces/TFLow';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FlowData } from '../../flow.component';
import { FlowDialogComponent } from '../flow-dialog/flow-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FlowDataService } from 'src/app/shared/services/flow-data.service';
import { CountryCodesService } from 'src/app/shared/services/country-codes.service';
import { debounceTime } from 'rxjs';
import { ICountryCodes } from 'src/app/shared/interfaces/ICountryCodes';
import { ArticleService } from 'src/app/shared/services/article-service.service';

@Component({
  selector: 'app-flow-form',
  templateUrl: './flow-form.component.html',
  styleUrls: ['./flow-form.component.scss']
})
export class FlowFormComponent {
  @Input() public formType: TFLow = 'patients';
  @Output() public next = new EventEmitter<FlowData>();
  @Input() public flowData: FlowData[];

  @ViewChildren('formInput') formInputs: QueryList<ElementRef>;

  public contactForm: FormGroup;

  public isMySelf: boolean = true; // switcher patients form

  // set up default placeholder styles for select element
  public isEcosystemPositionPlaceholder = true;

  // if flowType = ecosystem it saves the data for select input
  public ecosystemPositions: string[];

  public isSending: boolean = false; // when form is submiting

  // untill back will done we generate a password manually
  private password: any = 'test' + Math.floor(Math.random() * 100) + 1;

  // for detecting when user change flow and apply appropirate form for him
  private oldFormType: TFLow;

  // when user submits a form, it will show him the check email dialog
  private dialogConfig: MatDialogConfig = new MatDialogConfig();

  // for telephone input
    public telephonePadding: number = 90;
    public inputCountry: ICountryCodes = {
        "name": "United States",
        "dial_code": "+1",
        "code": "US"
    };
    public isOpenedPhoneDropdown: boolean = false;
    private selectedCountryCode: string = "+1";

  constructor(
      private authService: AuthService,
      private fb: FormBuilder,
      private dialog: MatDialog,
      private errorSnackBar: MatSnackBar,
      private flowDataService: FlowDataService,
      private articleService: ArticleService,
      private countriesData: CountryCodesService,
      private renderer: Renderer2,
      @Optional() private dialogRef: MatDialogRef<FlowDialogComponent>
  ) {}

  ngOnInit(): void {
    this.initContactForm();
    this.initDialogConfig();
    this.initEcosystemPositions();
    this.oldFormType = this.formType;

  }

  ngDoCheck(): void {
    if(this.oldFormType === this.formType) return
    if(this.oldFormType !== this.formType) {
      this.oldFormType = this.formType;
      this.initContactForm();
    }
  }

  ngAfterViewInit(): void {
    this.listenPhoneInput();
    this.initTabindexOrder();
  }

  private initContactForm(): void {
    switch(this.formType) {
      case 'patients': {
        this.contactForm = this.fb.group({
          firstName: [''],
          lastName: [''],
          phone: [''],
          email: [''],
          location: [''],
        });
        break;
      }
      default: {
        this.contactForm = this.fb.group({
          companyName: [''],
          firstName: [''],
          lastName: [''],
          position: ['', Validators.required],
          phone: [''],
          email: [''],
          location: [''],
        });
        break;
      }
    }
  }

  private initTabindexOrder(): void {
    this.formInputs.forEach((input, i) => {
        let index = (i + 1).toString();
        this.renderer.setAttribute(input.nativeElement, 'tabindex', index);
    })
  }

  private initEcosystemPositions() {
    if(this.formType !== 'ecosystem') return
    const title = this.flowData[2].companyType || ""; // we took from company type
    this.ecosystemPositions = this.flowDataService.getEcosystemPositionsByTitle(title);
  }

  // for Patients Sign up
  public chooseSigningUpFor(isMySelf: boolean): void {
    this.isMySelf = isMySelf;
  }

  public deactivePositionSelectPlaceholder(): void {
    if(!this.isEcosystemPositionPlaceholder) return
    this.isEcosystemPositionPlaceholder = false;
  }

  // for patiensts flow
  public onNextStep(): void {
    let currentIsMySelft  = this.isMySelf;
    let password = this.password;
    let phone = this.joinPhoneParts();


    let flowData = Object.assign(this.contactForm.value, {
            'isMySelf': currentIsMySelft,
            'password': password,
            'phone': phone
        })

        console.log(flowData);

    this.next.emit(flowData);
  }


   public onContactFormSubmit(): void {
    this.isSending = true;

    // we register a user for sending a letter
    // now registration unneeded
    // but we still have to send password for correct back-end working

    let password = this.password;
    let phone = this.joinPhoneParts();

    let body = Object.assign(
        this.contactForm.value,
        ...this.flowData,
        { password: password },
        { phone: phone }
    );

    this.authService.registration(body)
        .subscribe({
            next: res => {
                console.log(res);
                this.isSending = false;
                this.openCheckEmailModalWindow();
            },
            error: error => {
                console.log(error.message);
                this.errorSnackBar.open(error.message, 'Close', {
                    duration: 10000,
                    verticalPosition: "top"
                })
                this.isSending = false;
            }
        });
    }

        // for other flows
    private initDialogConfig(): void {
        this.dialogConfig.width = '630px';
        this.dialogConfig.height = '500px';
        this.dialogConfig.disableClose = true;
    }

    public openCheckEmailModalWindow(): void {
        this.dialog.open(CheckEmailComponent, this.dialogConfig);
        this.dialog.afterAllClosed.subscribe(()=> this.articleService.reinitArticleForm());
        // Check if FlowDialogComponent is open as a MatDialog before attempting to close it
        if (this.dialogRef && this.dialogRef.componentInstance) {
            this.dialogRef.close();
        }
    }


    // for phone input we need to separate logic ... to put it into
    private joinPhoneParts(){
        let phone = this.contactForm.get('phone')?.value;
        return this.selectedCountryCode + phone.split("-").join("");
    }

    public onCodeSelected(code: string): void {
        this.telephonePadding = 60 + 15 * code.length;
        this.selectedCountryCode = code;
    }


     listenPhoneInput() {
        this.contactForm.get('phone')?.valueChanges
            .pipe(debounceTime(500))
            .subscribe((value) => {
                this.handlePhoneInput(value);
            });
      }

      private handlePhoneInput(inputValue: string): void {
        const formattedPhoneInput = this.formatPhoneInput(inputValue);
        this.contactForm.patchValue({"phone": formattedPhoneInput}, {emitEvent: false}) // { emitEvent: false
      }

      private formatPhoneInput(inputValue: string): string {
        if (!inputValue) return '';

        let countryCode: ICountryCodes | '' = '';
        let cleanedInput = this.cleanPhoneInput(inputValue);

        if(cleanedInput.startsWith("+")) {
            countryCode = this.matchesCountryCode(cleanedInput);
        }

        // Check if cleanedInput matches any combination of currency codes
        if (countryCode) {
            this.inputCountry = countryCode;
            this.onCodeSelected(this.inputCountry.dial_code);
            this.isOpenedPhoneDropdown = false;
            cleanedInput = cleanedInput.replace(countryCode.dial_code, '');
        }

        // Add spaces every three characters
        const formattedInput = this.addSpacesEveryThreeCharacters(cleanedInput);

        return formattedInput;
      }

      private cleanPhoneInput(inputValue: string): string {
        // Remove any character that is not allowed in a phone number
        return inputValue.replace(/[^\d+]/g, '');
      }

      private matchesCountryCode(inputValue: string): ICountryCodes | '' {
        const matchingCode = this.countriesData.getCountryCodes().find(country => inputValue.startsWith(country.dial_code));
        return matchingCode || "";
      }

      private addSpacesEveryThreeCharacters(inputValue: string): string {
        if(inputValue.length < 4) return inputValue;
        // Add spaces every three characters
        const groups = inputValue.match(/.{1,3}/g);
        const formattedValue = groups?.reduce((acc, group, index) => {
            // Add hyphen between groups except for the last one
            const separator = index < 2 ? "-" : "";
            return acc + group + separator;
          }, '');
          console.log(formattedValue);

        return formattedValue || '';
      }


}
