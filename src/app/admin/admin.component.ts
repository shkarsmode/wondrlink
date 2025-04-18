import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
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
export class AdminComponent implements OnInit {

    public avatarFile: any;
    public user: IUser;
    public activeUsersCount: number = 0;
    public isOpened: boolean = false;
    public countOfPosts: number = 0;
    public isLoadingUser: boolean = false;

    constructor(
        public authService: AuthService,
        public userService: UserService,
        private postsService: PostsService,
        private cloudinaryService: CloudinaryService,
        private router: Router
    ) {}

    public ngOnInit(): void {
        this.getUserAndCountOfPosts();
        this.getActiveUsersCount();
        this.subscribeOnUserChanginges();
    }

    public getActiveUsersCount(): void {
        this.userService.getActiveUsersCount()
            .pipe(take(1))
            .subscribe(response => this.activeUsersCount = response.count);
    }

    private subscribeOnUserChanginges(): void {
        this.userService.profileUpdated$
            .subscribe(this.getUserAndCountOfPosts.bind(this))

        this.userService.approvedUsersUpdated$
        .subscribe(this.getActiveUsersCount.bind(this))
    }

    public toggleBurgerMenu = () => this.isOpened = !this.isOpened;

    public uploadAndUpdateUserAvatar(): void {
        this.cloudinaryService.uploadImageAndGetUrl(this.avatarFile)
            .subscribe(this.updateUserAvatar.bind(this));
    }

    private updateUserAvatar(image: ImageUrlResponseDto): void {
        const userId = this.user.id;
        if (!userId) return;

        this.userService.updateUserAvatar(userId, image.imageUrl.url)
            .subscribe(affected => 
                (affected.affected ? this.getUserAndCountOfPosts : null)?.call(this)
            );
    }

    private getUserAndCountOfPosts(): void {
        this.isLoadingUser = true;
        this.userService.getUser()
            .subscribe(user => {
                this.user = user;
                this.getCountOfPosts(user.id);
            });
    }

    private getCountOfPosts(id: number): void {
        this.postsService.getCountOfPostsByUserId(id)
            .subscribe(count => {
                this.countOfPosts = count;
                this.isLoadingUser = false;
            });
    }

    public onFileChanged(event: any): void{
        this.avatarFile = event.target.files[0];
    }

    public logout(): void {
        this.router.navigate(['/login']);
        this.authService.logout();
    }
}
