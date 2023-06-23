import { Component } from '@angular/core';
import { IUser } from 'src/app/shared/interfaces/IUser';
import { UserTypeEnum } from 'src/app/shared/interfaces/UserTypeEnum';
import { UserService } from '../../../shared/services/user.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent {

    public users: IUser[];
    public allUsersCount: number;
    public isLoading: boolean = false;
    public pagesCount: number;

    private limit: number = 10; // Number of items per page
    public page: number = 0; // Current page number    
    private deleteTimeout: any;
    private type: UserTypeEnum | null = null;
    public isDeleting: boolean = false;
    public activeDeletingIndex: number = -1;

    constructor(
        private userService: UserService
    ) {}

    public ngOnInit(): void {
        this.getUsers();
    }

    private setPagesCount(): void {
        this.pagesCount = Math.ceil(this.allUsersCount / this.limit);
        console.log(this.pagesCount)
    }

    private getUsers(isAddToExciting: boolean = false): void {
        this.isLoading = true;
        this.userService.getUserWithPagination(this.limit, this.page, this.type)
            .subscribe(response => {
                if (isAddToExciting) {
                    response.users.forEach(user => this.users.push(user));
                } else {
                    this.users = response.users;
                }
                
                this.allUsersCount = response.allUsersCount;
                
                this.setPagesCount();
                this.isLoading = true;
            });
    }

    public onPageChange(pageNumber: number) {
        this.page = pageNumber;
        this.getUsers();
    }

    public onButtonMoreClick(): void {
        this.page++;
        this.getUsers(true);
    }

    private deleteUserByID(id: number): void {
        
        return;
        const postToDelete = this.users.filter(user => user.id === id)[0];
        const indexPostToDelete = this.users.indexOf(postToDelete);
        this.users = this.users.filter(user => user.id !== id);

        // this.userService.deleteUserById(id)
        //     .pipe(take(1))
        //     .subscribe({
        //         next: _ => {
        //             const tempLimit = this.limit;
        //             const tempPage = this.page;

        //             this.limit = 1;
        //             this.page = this.users.length;

        //             this.getPosts(true);

        //             this.limit = tempLimit;
        //             this.page = tempPage;


        //             console.log('Post was deleted')
        //         },
        //         error: _ => {
        //             this.users.splice(indexPostToDelete, 0, postToDelete);
        //             alert(`Something went wrong. Can't delete this user ${indexPostToDelete + 1}`);
        //         }
        //     });
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

}
