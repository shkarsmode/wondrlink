import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ImageUrlResponseDto } from 'src/app/shared/interfaces/imageUrlResponse.dto';
import { AuthService } from 'src/app/shared/services/auth.service';
import { PostsService } from 'src/app/shared/services/posts.service';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';

@Component({
    selector: 'app-adding-post',
    templateUrl: './adding-post.component.html',
    styleUrls: ['./adding-post.component.scss']
})
export class AddingPostComponent implements OnInit {

    public form: FormGroup;
    public isLoading: boolean = false;
    private userId: number;
    @ViewChild('preview') preview: ElementRef;

    constructor(
        private fb: FormBuilder,
        private cloudinaryService: CloudinaryService,
        private postsService: PostsService,
        private authService: AuthService,
        private jwt: JwtHelperService
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
            subHeader: ['', [Validators.required]],
            picture: ['', [Validators.required]],
            content: ['', Validators.required]
        });
    }

    public uploadPost(): void {
        if (this.form.invalid) return;

        this.isLoading = true;
        this.uploadAngGetPictureUrl();
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

    private uploadPostWithImage(response: ImageUrlResponseDto): void {
        const mainPicture = response.imageUrl.url;
        const createdAt = new Date().toISOString();
        const body = {
            createdAt,
            mainPicture,
            "header": this.header.value,
            "subHeader": this.subHeader.value,
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
    
    public isDrag: boolean = false;
    public drag() {
        this.isDrag = true;
    }

    public drop() {
        this.isDrag = false;
    }

    // Convenience getters for easy access to form controls
    public get header() { return this.form.get('header') as FormControl; }
    public get subHeader() { return this.form.get('subHeader') as FormControl; }
    public get picture() { return this.form.get('picture') as FormControl; }
    public get content() { return this.form.get('content') as FormControl; }
}
