import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IUser } from 'src/app/shared/interfaces/IUser';
import { ImageUrlResponseDto } from 'src/app/shared/interfaces/imageUrlResponse.dto';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserService } from 'src/app/shared/services/user.service';
import { CloudinaryService } from '../shared/services/cloudinary.service';
import { PostsService } from '../shared/services/posts.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {

    public avatarFile: any;
    public user: IUser;
    public isOpened: boolean = false;
    public countOfPosts: number = 0;

    constructor(
        public authService: AuthService,
        private userService: UserService,
        private postsService: PostsService,
        private cloudinaryService: CloudinaryService,
        private router: Router
    ) {}

    public ngOnInit(): void {
        this.getUserAnCountOfPosts();
    }

    public toggleBurgerMenu = () => this.isOpened = !this.isOpened;

    public uploadAndUpdateUserAvatar(): void {
        this.cloudinaryService.uplodaImageAndGetUrl(this.avatarFile)
            .subscribe(this.updateUserAvatar.bind(this));
    }

    private updateUserAvatar(image: ImageUrlResponseDto): void {
        const userId = this.user.id;
        if (!userId) return;

        this.userService.updateUserAvatar(userId, image.imageUrl.url)
            .subscribe(affected => 
                (affected.affected ? this.getUserAnCountOfPosts : null)?.call(this)
            );
    }

    private getUserAnCountOfPosts(): void {
        this.userService.getUser()
            .subscribe(user => {
                this.user = user;
                this.getCountOfPosts(user.id);
            });
    }

    private getCountOfPosts(id: number): void {
        this.postsService.getCountOfPostsByUserId(id)
            .subscribe(count => this.countOfPosts = count);
    }

    public onFileChanged(event: any): void{
        this.avatarFile = event.target.files[0];
    }

    public logout(): void {
        this.router.navigate(['/login']);
        this.authService.logout();
    }
}
