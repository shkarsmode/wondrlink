import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { IPost } from 'src/app/shared/interfaces/IPost';
import { CloudinaryService } from 'src/app/shared/services/cloudinary.service';
import { PostsService } from 'src/app/shared/services/posts.service';

@Component({
    selector: 'app-edit-post',
    templateUrl: './edit-post.component.html',
    styleUrls: ['./edit-post.component.scss']
})
export class EditPostComponent implements OnInit {

    public post: IPost;
    public form: FormGroup;
    public isLoading: boolean = false;
    public errorMessage: string;
    
    public isDeleting: boolean = false;
    public activeDeletingIndex: number = -1;
    public isDrag: boolean = false;
    public isUpdatedPicture: boolean = false;

    private deleteTimeout: any;
    private userId: number;
    private postId: number | null;
    @ViewChild('preview') preview: ElementRef;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private cloudinaryService: CloudinaryService,
        private postsService: PostsService,
        private location: Location
    ) {}

    public ngOnInit(): void {
        this.getInfoOfRoute();
    }

    private getInfoOfRoute(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');

            if (!id) {
                this.postId = null;
                return;
            }

            this.postId = parseInt(id);
            this.getPostById();
        });
    }

    private getPostById(): void {
        if (!this.postId) return;

        this.postsService.getPostById(this.postId)
            .subscribe({
                next: post => {
                    this.post = post;
                    this.initReactiveForm();
                },
                error: error => this.errorMessage = error.message
            });
    }

    private initReactiveForm(): void {
        this.form = this.fb.group({
            header: [this.post.header, Validators.required],
            subHeader: [this.post.subHeader, [Validators.required]],
            picture: [this.post.mainPicture, [Validators.required]],
            content: [this.post.htmlContent, Validators.required]
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
        this.isUpdatedPicture = true;
    }

    private uploadAngGetPictureUrl(): void {
        if (!this.isUpdatedPicture) {
            this.updatePostWithImage(this.picture.value);
            return;
        }

        this.cloudinaryService.uplodaImageAndGetUrl(this.picture.value)
            .subscribe({
                next: response => this.updatePostWithImage(response.imageUrl.url),
                error: error => console.log(error)
            });
    }

    private updatePostWithImage(url: string): void {
        const mainPicture = url;
        const createdAt = new Date().toISOString();
        const body = {
            id: this.post.id,
            createdAt,
            mainPicture,
            "header": this.header.value,
            "subHeader": this.subHeader.value,
            "htmlContent": this.content.value,
            "socialLinks": {
                "instagram": "https://www.instagram.com/shkarsmode/"
            }
        };

        this.postsService.updatePostById(body)
            .subscribe({
                next: res => {
                    this.isLoading = false;
                },
                error: error =>{
                    alert('Something went wrong: ' + error.message);
                    this.isLoading = false;
                }
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
    
    public drag() {
        this.isDrag = true;
    }

    public drop() {
        this.isDrag = false;
    }

    private deletePostByID(id: number): void {
        this.postsService.deletePostById(id)
            .pipe(take(1))
            .subscribe({
                next: _ => {
                    console.log('Post was deleted')
                    this.location.back();
                },
                error: _ => {
                    alert('Something went wrong. Can`t delete this post');
                }
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

        this.deletePostByID(id);
    }

    // Convenience getters for easy access to form controls
    public get header() { return this.form.get('header') as FormControl; }
    public get subHeader() { return this.form.get('subHeader') as FormControl; }
    public get picture() { return this.form.get('picture') as FormControl; }
    public get content() { return this.form.get('content') as FormControl; }
}
