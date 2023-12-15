import { Component, Input, Output, EventEmitter, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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

@Component({
  selector: 'app-flow-form',
  templateUrl: './flow-form.component.html',
  styleUrls: ['./flow-form.component.scss']
})
export class FlowFormComponent {
  @Input() public formType: TFLow = 'patients';
  @Output() public next = new EventEmitter<FlowData>();
  @Input() public flowData: FlowData[];

  public contactForm: FormGroup;

  public isMySelf: boolean = true;

  public isSending: boolean = false;
  public isButtonDisabled: boolean = true;

  // untill back will done
  private password: any = 'test' + Math.floor(Math.random() * 100) + 1;

  private oldFormType: TFLow;
  private dialogConfig: MatDialogConfig = new MatDialogConfig();

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
      private countriesData: CountryCodesService,
      @Optional() private dialogRef: MatDialogRef<FlowDialogComponent>
  ) {}

  ngOnInit(): void {
    this.initContactForm();
    this.initDialogConfig();
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
    console.log(this.contactForm.value)

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
          phone: [''],
          email: [''],
          location: [''],
        });
        break;
      }
    }
  }

  // for Patients Sign up
  public chooseSigningUpFor(isMySelf: boolean): void {
    this.isMySelf = isMySelf;
  }

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

  private initDialogConfig(): void {
    this.dialogConfig.width = '630px';
    this.dialogConfig.height = '500px';
    this.dialogConfig.disableClose = true;
  }

  onContactFormSubmit(): void {
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

    public openCheckEmailModalWindow(): void {
        this.dialog.open(CheckEmailComponent, this.dialogConfig);
        this.dialog.afterAllClosed.subscribe(()=> this.flowDataService.updateFlow(true))
        // Check if FlowDialogComponent is open as a MatDialog before attempting to close it
        if (this.dialogRef && this.dialogRef.componentInstance) {
            this.dialogRef.close();
        }
    }

    private joinPhoneParts(){
        let phone = this.contactForm.get('phone')?.value;
        return this.selectedCountryCode + phone.split(" ").join("");
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
        return groups?.join(' ') || ""
      }


}
