import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { IUser } from 'src/app/shared/interfaces/IUser';
import { PatientPositionRoleEnum } from 'src/app/shared/interfaces/PositionRoleEnum';
import { UserRoleEnum } from 'src/app/shared/interfaces/UserRoleEnum';
import { UserTypeEnum } from 'src/app/shared/interfaces/UserTypeEnum';
import { CompanyTypeEnum } from 'src/app/shared/interfaces/company-type.enum';
import { PatientSituationTypeEnum } from 'src/app/shared/interfaces/patient-situation-type.enum';
import { CloudinaryService } from 'src/app/shared/services/cloudinary.service';
import { UserService } from 'src/app/shared/services/user.service';
import { AuthService } from '../../../shared/services/auth.service';
import { FlowDataService } from '../../../shared/services/flow-data.service';

@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.scss'],
})
export class EditUserComponent implements OnInit {
    public user: IUser;
    public form: FormGroup;
    public errorMessage: string;
    public isDrag: boolean = false;
    public isLoading: boolean = false;
    public isDeleting: boolean = false;
    public isUpdatedPicture: boolean = false;
    public isUploadImageSelected: boolean = true;
    public isUserInited: boolean = false;
    public activeDeletingIndex: number = -1;
    public cancerTypeEnum: Array<string>;
    public diseaseCatogories: Array<string>;
    public subgroupFunction: Array<string> = [];
    public readonly Object: typeof Object = Object;
    public userStatus: typeof UserRoleEnum = UserRoleEnum;
    public userTypeEnum: typeof UserTypeEnum = UserTypeEnum;
    public readonly companyTypeEnum: typeof CompanyTypeEnum = CompanyTypeEnum;
    public readonly patientSituationTypeEnum: typeof PatientSituationTypeEnum =
        PatientSituationTypeEnum;
    public readonly patientPositionEnum: typeof PatientPositionRoleEnum = PatientPositionRoleEnum;


    private deleteTimeout: any;
    public userId: number | null;
    @ViewChild('preview') preview: ElementRef;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private cloudinaryService: CloudinaryService,
        private userService: UserService,
        private authService: AuthService,
        private locationService: Location,
        private flowDataService: FlowDataService
    ) {}

    public ngOnInit(): void {
        this.getInfoOfRoute();
        this.setCancerTypeEnumAndDiseaseCategories();
    }

    private setCancerTypeEnumAndDiseaseCategories(): void {
        this.cancerTypeEnum = this.flowDataService.getCancerTypes();
        this.diseaseCatogories = this.flowDataService.diseaseCatogories;
    }

    private getInfoOfRoute(): void {
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');

            if (!id) {
                this.userId = null;
                return;
            }

            this.userId = parseInt(id);
            this.getUserById();
        });
    }

    public userAddInfoFieldKeys: Array<string> = [];
    private getUserById(): void {
        if (!this.userId) return;

        this.userService
            .getUserById(this.userId)
            .pipe(take(1))
            .subscribe({
                next: (user) => {
                    this.user = user;
                    this.userAddInfoFieldKeys = Object.keys(this.user.additionalInfo);
                    this.user.type = user.type ? user.type : UserTypeEnum.None;
                    this.isUserInited = true;
                    this.initReactiveForm();
                },
                error: (error) => (this.errorMessage = error.message),
            });
    }

    private initReactiveForm(): void {
        this.form = this.fb.group({
            firstName: [
                this.user.firstName,
                [Validators.required, Validators.minLength(2)],
            ],
            lastName: [
                this.user.lastName,
                [Validators.required, Validators.minLength(2)],
            ],
            email: [this.user.email, [Validators.required, Validators.email]],
            type: [this.user.type, Validators.required],
            picture: [this.user.avatar],
            location: [this.user.location, Validators.required],
            role: [this.user.role, Validators.required],
            phone: [this.user.phone, Validators.required],
            patientSituationType: [this.user.patientSituationType],
            diseaseCategory: [this.user.diseaseCategory],
            cancerType: [this.user.cancerType],
            diseaseDetails: [this.user.diseaseDetails],
            companyName: [this.user.companyName], // Organization
            companyType: [this.user.companyType], // Subgroup
            isMySelf: [this.patientPositionEnum[this.user.isMySelf]],
            position: [this.user.position],
            function: [this.user.function]
        }); 
        
    }

    

    public toggleUploadImageType(): void {
        if (this.isUpdatedPicture) {
            this.form.patchValue({
                picture: null,
            });
            this.preview.nativeElement.innerHTML = null;
        }

        this.isUploadImageSelected = !this.isUploadImageSelected;

        console.log('isUpdatedPicture', this.isUpdatedPicture);
    }

    public handleUrlImage() {
        if (!this.isValidUrl) return;

        const preview = document.getElementById('preview');
        const previewImg = document.createElement('img');
        previewImg.setAttribute('src', this.picture.value);
        preview!.innerHTML = '';
        preview!.appendChild(previewImg);
        this.isUpdatedPicture = true;
    }

    public get isValidUrl(): boolean {
        const pattern = /^https?:\/\/.{5,}$/;
        const isValidUrl = pattern.test(this.picture.value);

        return isValidUrl;
    }

    public updateUser(): void {
        if (this.form.invalid) return;

        this.isLoading = true;
        this.uploadAngGetPictureUrl();
    }

    public onFileSelected(event: Event): void {
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];

        this.form.patchValue({
            picture: file,
        });

        // if (file) {
        //     const reader = new FileReader();
        //     reader.onload = (event) => {
        //         const fileContent = event.target?.result as string;
        //         this.form.patchValue({
        //             picture: fileContent
        //         });
        //     };
        //     reader.readAsDataURL(file);
        // }

        this.isUpdatedPicture = true;
    }

    private uploadAngGetPictureUrl(): void {
        if (
            !this.isUpdatedPicture ||
            !this.isUploadImageSelected ||
            this.picture.value === ''
        ) {
            this.updateUserWithImage(this.picture.value);
            return;
        }

        this.cloudinaryService
            .uploadImageAndGetUrl(this.picture.value)
            .subscribe({
                next: (response) =>
                    this.updateUserWithImage(response.imageUrl.url),
                error: (error) => console.log(error),
            });
    }

    private updateUserWithImage(url: string): void {
        const avatar = url;
        const id = this.user.id;

        const body = {
            avatar,
            firstName: this.firstName.value,
            lastName: this.lastName.value,
            email: this.email.value,
            type:
                this.type.value === this.userTypeEnum.None
                    ? null
                    : this.type.value,
            companyName: this.companyName.value,
            location: this.location.value,
            role: this.role.value,
            phone: this.phone.value,
            patientSituationType: this.patientSituationType.value,
            cancerType: this.cancerType.value,
            diseaseCategory: this.diseaseCategory.value,
            companyType: this.subgroup.value,
            diseaseDetails: this.diseaseDetails.value,
            position: this.position.value,
            function: this.function.value,
        } as IUser;

        console.log(body);

        this.userService.updateUserById(id, body).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.isUpdatedPicture = false;

                const token = localStorage.getItem('token') as string;
                const myId = this.authService.getUserIdFromToken(token);
                if (myId === id) {
                    this.userService.profileUpdated$.next(true);
                }
            },
            error: (error) => {
                alert('Something went wrong: ' + error.message);
                this.isLoading = false;
            },
        });
    }

    public dragNdrop(event: any) {
        const fileName = URL.createObjectURL(event.target.files[0]);
        const preview = document.getElementById('preview');
        const previewImg = document.createElement('img');
        previewImg.setAttribute('src', fileName);
        preview!.innerHTML = '';
        preview!.appendChild(previewImg);

        this.onFileSelected(event);
    }

    public drag() {
        this.isDrag = true;
    }

    public drop() {
        this.isDrag = false;
    }

    private deleteUserByID(id: number): void {
        this.userService
            .deleteUserById(id)
            .pipe(take(1))
            .subscribe({
                next: (_) => {
                    this.locationService.back();
                    if (this.user.status === 'approved') {
                        this.userService.approvedUsersUpdated$.next(true);
                    }
                },
                error: (_) => {
                    alert('Something went wrong. Can`t delete this post');
                },
            });
    }

    public startDeleteTimeout(index: number): void {
        this.isDeleting = true;
        this.activeDeletingIndex = index;
        this.deleteTimeout = setTimeout(() => {
            this.deleteItem(index);
        }, 1000);
    }

    public clearDeleteTimeout(): void {
        clearTimeout(this.deleteTimeout);
        this.activeDeletingIndex = -1;
        this.isDeleting = false;
    }

    public deleteItem(id: number): void {
        this.isDeleting = false;
        this.activeDeletingIndex = -1;

        this.deleteUserByID(id);
    }

    public get functionEnum(): Array<string> {        
        if(!this.isUserInited) return []; 
        return this.flowDataService.getSubgroupFunctionByTitle(this.subgroup.value);
    }

    // Convenience getters for easy access to form controls
    public get firstName(): FormControl {
        return this.form.get('firstName') as FormControl;
    }
    public get lastName(): FormControl {
        return this.form.get('lastName') as FormControl;
    }
    public get email(): FormControl {
        return this.form.get('email') as FormControl;
    }
    public get type(): FormControl {
        return this.form.get('type') as FormControl;
    }
    public get picture(): FormControl {
        return this.form.get('picture') as FormControl;
    }
    public get hospitalName(): FormControl {
        return this.form.get('hospitalName') as FormControl;
    }
    public get companyName(): FormControl {
        return this.form.get('companyName') as FormControl;
    }
    public get location(): FormControl {
        return this.form.get('location') as FormControl;
    }
    public get role(): FormControl {
        return this.form.get('role') as FormControl;
    }
    public get phone(): FormControl {
        return this.form.get('phone') as FormControl;
    }
    public get patientSituationType(): FormControl {
        return this.form.get('patientSituationType') as FormControl;
    }
    public get diseaseCategory(): FormControl {
        return this.form.get('diseaseCategory') as FormControl;
    }
    public get diseaseDetails(): FormControl {
        return this.form.get('diseaseDetails') as FormControl;
    }
    public get cancerType(): FormControl {
        return this.form.get('cancerType') as FormControl;
    }
    public get subgroup(): FormControl { // subgroup flowSelect 
        return this.form.get('companyType') as FormControl; //companyType needs to be replaced with subgroup 
    }
    public get isMySelf(): FormControl {
        return this.form.get('isMySelf') as FormControl;
    }
    public get position(): FormControl {
        return this.form.get('position') as FormControl;
    }
    public get function(): FormControl {
        return this.form.get('function') as FormControl;
    }
}
