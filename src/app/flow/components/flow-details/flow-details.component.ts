import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FlowDataService } from 'src/app/shared/services/flow-data.service';
import { FlowData } from '../../flow.component';

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

  public onFormSubmit(): void {
    const cancerTypeValue = this.detailsForm.get('cancerType')?.value;

    let body = Object.assign(this.detailsForm.value, ...this.flowData, {cancerType: cancerTypeValue || null });
    console.log(body);
  }

}
