import { ChangeDetectorRef, Component, Input, Optional} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FlowDataService } from 'src/app/shared/services/flow-data.service';
import { FlowData } from '../../flow.component';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FlowDialogComponent } from '../flow-dialog/flow-dialog.component';
import { CheckEmailComponent } from 'src/app/shared/dialogs/check-email/check-email.component';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-flow-details',
  templateUrl: './flow-details.component.html',
  styleUrls: ['./flow-details.component.scss']
})
export class FlowDetailsComponent {
  @Input() public flowData: FlowData[];

  public detailsForm: FormGroup;

  public diseaseCatogories: string[] = [
    "Cancer",
    "Autoimmune",
    "Rare/Other"
  ];

  public isSending: boolean = false;

  public isCancerTypeSelect: boolean = false;
  public cancerTypes: string[];

  private dialogConfig: MatDialogConfig = new MatDialogConfig()


  constructor(
    private flowDataService: FlowDataService,
    private fb: FormBuilder,
    private authService: AuthService,
    private detRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private errorSnackBar: MatSnackBar,
    @Optional() private dialogRef: MatDialogRef<FlowDialogComponent>
  ){}

  ngOnInit(): void {
    this.initDetailsForm();
    this.initCancerTypes();
    this.onDiseaseCategoryChange();
    this.initDialogConfig();
  }

  ngAfterContentChecked(): void {
    this.detRef.detectChanges()
  }

  public initDetailsForm() {
    this.detailsForm = this.fb.group({
      diseaseCategory: ['', Validators.required],
      cancerType: [''],
      diseaseDetails: [null, Validators.maxLength(500)]
    })
  }

  private onDiseaseCategoryChange():void {
    this.detailsForm.get('diseaseCategory')?.valueChanges
      .subscribe(() => this.handleCancerTypesSelect())
  }

  public handleCancerTypesSelect(): void {
    const open = () => this.isCancerTypeSelect = true;
    const close = () => this.isCancerTypeSelect = false;
    const category = this.detailsForm.get('diseaseCategory')?.value;

    if(category === "Cancer") {
      open()
      this.detailsForm.get('cancerType')?.setValidators(Validators.required)
    }
    else {
      this.detailsForm.get('cancerType')?.clearValidators();
      this.detailsForm.get('cancerType')?.setValue("");
      close();
    }
  }

  private initCancerTypes() {
    this.cancerTypes = this.flowDataService.getCancerTypes();
  }

  private initDialogConfig(): void {
    this.dialogConfig.width = '630px';
    this.dialogConfig.height = '500px';
    this.dialogConfig.disableClose = true;
  }

  public onFormSubmit(): void {
    const cancerTypeValue = this.detailsForm.get('cancerType')?.value;

    let body = Object.assign(this.detailsForm.value, ...this.flowData, {cancerType: cancerTypeValue || null });

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
