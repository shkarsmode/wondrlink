import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogConfig } from '@angular/material/dialog';
import { TFLow } from 'src/app/shared/interfaces/TFLow';
import { AuthService } from 'src/app/shared/services/auth.service';

const commonRequiredFields = ['email', 'firstName', 'lastName', 'phone', 'password', 'location'];


@Component({
  selector: 'app-flow-form',
  templateUrl: './flow-form.component.html',
  styleUrls: ['./flow-form.component.scss']
})
export class FlowFormComponent {
  @Input() public formType: TFLow = 'patients';

  public contactForm: FormGroup;

  public isMySelf: boolean = true;

  public isSending: boolean = false;
  public isButtonDisabled: boolean = true;

  // untill back will done
  private password: any = 'test' + Math.floor(Math.random() * 100) + 1;
  private oldFormType: TFLow;

  constructor(
      private authService: AuthService,
      private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initContactForm();
    this.oldFormType = this.formType;
  }

  ngDoCheck(): void {
    if(this.oldFormType === this.formType) return
    if(this.oldFormType !== this.formType) {
      this.oldFormType = this.formType;
      this.initContactForm();
    }
  }

  private initContactForm(): void {
    switch(this.formType) {
      case 'patients': {
        this.contactForm = this.fb.group({
          isMySelf: [this.isMySelf],
          firstName: [''],
          lastName: [''],
          phone: [''],
          email: [''],
          location: [''],
        });
        break;
      }
      case 'drug-developers' || 'ecosystem': {
        console.log('contact init');
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
    console.log(this.contactForm.value)
  }

  onContactFormSubmit(): void {
    // this.isSending = true;
    // const formValues = this.contactForm.value;
    console.log(this.contactForm.value);
 }


//   public onSubmitButton(formName: 'Patient' | 'Physician' | 'Industry'): void {
//     this.isSending = true;
//     this.errorMessage = '';
//     let requiredFields: string[] = [];

//     switch(formName) {
//         case 'Patient': requiredFields = this.patientRequiredFields; break;
//         case 'Physician': requiredFields = this.physicianRequiredFields; break;
//         case 'Industry': requiredFields = this.industryRequiredFields; break;
//     }

//     const body = {
//         email: this.email,
//         password: this.password,
//         firstName: this.firstName,
//         lastName: this.lastName,
//         phone: this.phone,
//         hospitalName: this.hospital,
//         companyName: this.company,
//         location: this.location,
//         isMySelf: this.isMySelf
//     };

//     const filteredBody = Object.fromEntries(
//         Object.entries(body)
//             .filter(([key]) => requiredFields.includes(key))
//     );

//     const allFieldsFilled = Object.values(filteredBody)
//         .every(value => value !== undefined && value !== '');
//     console.log(filteredBody);

//     if (!allFieldsFilled) {
//         this.isSending = false;
//         this.errorMessage = 'Please fill all the fields';
//         return;
//     }

//     this.authService.registration(body)
//         .subscribe({
//             next: res => {
//                 console.log(res);
//                 this.isSending = false;
//                 this.errorMessage = '';
//                 this.openCheckEmailModalWindow();
//             },
//             error: error => {
//                 this.errorMessage = error.message;
//                 this.isSending = false;
//             }
//         });

// }




}

