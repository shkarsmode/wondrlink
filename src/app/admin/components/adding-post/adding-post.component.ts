import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ImageUrlResponseDto } from 'src/app/shared/interfaces/imageUrlResponse.dto';
import { AuthService } from 'src/app/shared/services/auth.service';
import { PostsService } from 'src/app/shared/services/posts.service';
import { UserService } from 'src/app/shared/services/user.service';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';

@Component({
    selector: 'app-adding-post',
    templateUrl: './adding-post.component.html',
    styleUrls: ['./adding-post.component.scss']
})
export class AddingPostComponent implements OnInit {
    public form: FormGroup;
    public isLoading: boolean = false;
    public isUploadImageSelected: boolean = true;
    public isDrag: boolean = false;
    public isAuto: boolean = true;

    private userId: number;
    @ViewChild('preview') preview: ElementRef;
    @ViewChild('subheader') subheader: ElementRef;

    constructor(
        private fb: FormBuilder,
        private cloudinaryService: CloudinaryService,
        private postsService: PostsService,
        private authService: AuthService,
        private jwt: JwtHelperService,
        private userService: UserService
    ) {}

    public ngOnInit(): void {
        this.initReactiveForm();
        this.getUserId();
    }

    private getUserId(): void {
        const token = this.authService.token;
        if (!token) return; 

        this.userId = this.jwt.decodeToken(token).id;
    }

    private initReactiveForm(): void {
        this.form = this.fb.group({
            header: ['', Validators.required],
            subHeader: ['', []],
            picture: ['', [Validators.required]],
            content: ['', Validators.required]
        });
    }

    public uploadPost(): void {
        if (this.form.invalid) return;

        this.isLoading = true;
        (this.isUploadImageSelected ? 
            this.uploadAngGetPictureUrl : 
            this.uploadPostWithImage
        ).call(this);
    }

    public onFileSelected(event: Event): void {
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];

        this.form.patchValue({
            picture: file
        });
    }

    private uploadAngGetPictureUrl(): void {
        this.cloudinaryService.uplodaImageAndGetUrl(this.picture.value)
            .subscribe({
                next: response => this.uploadPostWithImage(response),
                error: error => console.log(error)
            })
    }

    private uploadPostWithImage(response?: ImageUrlResponseDto): void {
        let mainPicture: string;

        if (response) mainPicture = response.imageUrl.url;
        else mainPicture = this.picture.value;

        const createdAt = new Date().toISOString();
        const body = {
            createdAt,
            mainPicture,
            "header": this.header.value,
            "subHeader": this.isAuto ? this.autoSubHeader : this.subHeader.value,
            "htmlContent": this.content.value,
            "socialLinks": {
                "instagram": "https://www.instagram.com/shkarsmode/"
            },
            "userId": this.userId
        };

        this.postsService.uploadPost(body)
            .subscribe(res => {
                this.isLoading = false;
                this.form.reset();
                this.preview.nativeElement.innerHTML = null;

                this.userService.profileUpdated$.next(true);

            });
    }

    public dragNdrop(event: any) {
        var fileName = URL.createObjectURL(event.target.files[0]);
        var preview = document.getElementById("preview");
        var previewImg = document.createElement("img");
        previewImg.setAttribute("src", fileName);
        preview!.innerHTML = "";
        preview!.appendChild(previewImg);

        this.onFileSelected(event);
    }

    public handleUrlImage() {
        if (!this.picture.value) return;
        
        const preview = document.getElementById('preview');
        const previewImg = document.createElement('img');
        previewImg.setAttribute("src", this.picture.value);
        preview!.innerHTML = '';
        preview!.appendChild(previewImg);
    }
    
    public drag() {
        this.isDrag = true;
    }

    public drop() {
        this.isDrag = false;
    }

    public toggleUploadImageType(): void {
        this.isUploadImageSelected = !this.isUploadImageSelected;
        
        this.form.patchValue({
            picture: null
        });

        this.preview.nativeElement.innerHTML = null;
    }


    public onAutogenerationChange(): void {
        this.isAuto = !this.isAuto;

        if(this.isAuto) { this.subHeader.clearValidators();}
        else { this.subHeader.addValidators(Validators.required);}         
        
        this.subHeader.updateValueAndValidity();
    }

    public autoSubHeader: string = '';
    public onGetTextForSubHeader(text: string): void {
        this.autoSubHeader = this.generateSubHeader(text);
    }
    
    public generateSubHeader(text: string): string {
        text = text.replaceAll('&nbsp;', '').trim();
        if(text.length >= 160 ) return text.slice(0, 160) + "...";
        return text;
    }   

    // Convenience getters for easy access to form controls
    public get header() { return this.form.get('header') as FormControl; }
    public get subHeader() { return this.form.get('subHeader') as FormControl; }
    public get picture() { return this.form.get('picture') as FormControl; }
    public get content() { return this.form.get('content') as FormControl; }
}
