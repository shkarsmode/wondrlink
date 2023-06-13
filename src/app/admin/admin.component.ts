import { Component } from '@angular/core';
import { IUser } from 'src/interfaces/IUser';
import { ImageUrlResponseDto } from 'src/interfaces/imageUrlResponse.dto';
import { AuthService } from 'src/services/auth.service';
import { UserService } from 'src/services/user.service';
import { CloudinaryService } from '../../services/cloudinary.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {

    public avatarFile: any;
    public user: IUser;

    constructor(
        public authService: AuthService,
        private userService: UserService,
        private cloudinaryService: CloudinaryService
    ) {}

    public ngOnInit(): void {
        this.getUser();
    }

    public uploadAndUpdateUserAvatar(): void {
        this.cloudinaryService.uplodaImageAndGetUrl(this.avatarFile)
            .subscribe(this.updateUserAvatar.bind(this));
    }

    private updateUserAvatar(image: ImageUrlResponseDto): void {
        const userId = this.user.id;
        if (!userId) return;

        this.userService.updateUserAvatar(userId, image.imageUrl.url)
            .subscribe(affected => 
                (affected.affected ? this.getUser : null)?.call(this)
            );
    }

    private getUser(): void {
        this.userService.getUser()
            .subscribe(user => this.user = user);
    }

    public onFileChanged(event: any): void{
        this.avatarFile = event.target.files[0];
    }
}
