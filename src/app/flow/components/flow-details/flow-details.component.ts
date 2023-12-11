import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FlowDataService } from 'src/app/shared/services/flow-data.service';

@Component({
  selector: 'app-flow-details',
  templateUrl: './flow-details.component.html',
  styleUrls: ['./flow-details.component.scss']
})
export class FlowDetailsComponent {

  public detailsForm: FormGroup;

  public diseaseCatogories: string[] = [
    "Cancer",
    "Autoimmune",
    "Rare/Other"
  ];

  public isSending: boolean = false;

  public isCancerTypeSelect: boolean = false;
  public cancerTypes: string[];

  constructor(
    private flowDataService: FlowDataService,
    private fb: FormBuilder,
    private detRef: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.initDetailsForm();
    this.initCancerTypes();
    this.onDiseaseCategoryChange();
  }

  ngAfterContentChecked(): void {
    this.detRef.detectChanges()
  }

  public initDetailsForm() {
    this.detailsForm = this.fb.group({
      diseaseCategory: ['', Validators.required],
      cancerType: [''],
      details: ['',]
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
    console.log(this.cancerTypes)
  }

  public onFormSubmit(): void {
    console.log(this.detailsForm.value)
  }

}
