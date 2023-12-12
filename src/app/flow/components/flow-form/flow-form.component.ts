import { Component, Input, Output, EventEmitter, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { CheckEmailComponent } from 'src/app/shared/dialogs/check-email/check-email.component';
import { TFLow } from 'src/app/shared/interfaces/TFLow';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FlowData } from '../../flow.component';
import { FlowDialogComponent } from '../flow-dialog/flow-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(
      private authService: AuthService,
      private fb: FormBuilder,
      private dialog: MatDialog,
      private errorSnackBar: MatSnackBar,
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

    let flowData = Object.assign(this.contactForm.value, {
            'isMySelf': currentIsMySelft,
            'password': password})
    this.next.emit(flowData);
  }

  private initDialogConfig(): void {
    this.dialogConfig.width = '630px';
    this.dialogConfig.height = '500px';
    this.dialogConfig.disableClose = true;
  }

  onContactFormSubmit(): void {
    this.isSending = true;

    let password = this.password;

    let body = Object.assign(
        this.contactForm.value,
        ...this.flowData,
        { password: password }
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
                this.errorSnackBar.open(error.message, '', {
                    verticalPosition: "top"
                })
                this.isSending = false;
            }
        });
    }

    public openCheckEmailModalWindow(): void {
        this.dialog.open(CheckEmailComponent, this.dialogConfig);

        // Check if FlowDialogComponent is open as a MatDialog before attempting to close it
        if (this.dialogRef && this.dialogRef.componentInstance) {
            this.dialogRef.close();
        }
    }

}

