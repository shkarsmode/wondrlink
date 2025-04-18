import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { IUser } from 'src/app/shared/interfaces/IUser';
import { UserTypeEnum } from 'src/app/shared/interfaces/UserTypeEnum';
import { UserService } from '../../../shared/services/user.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
    public users: IUser[];
    public allUsersCount: number;
    public isLoading: boolean = true;
    public isLoadingMore: boolean = false;
    public pagesCount: number;
    public sortBy: UserTypeEnum | string = 'all';
    public userTypeEnum: typeof UserTypeEnum = UserTypeEnum;

    private limit: number = 10; // Number of items per page
    public page: number = 0; // Current page number
    private deleteTimeout: any;
    private type: UserTypeEnum | null = null;
    public isDeleting: boolean = false;
    public activeDeletingIndex: number = -1;

    constructor(public userService: UserService, public router: Router) {}

    public ngOnInit(): void {
        this.blockPageForModerators();
        this.getLocalStorageSortBy();
        this.getUsers();
    }

    private blockPageForModerators(): void {
        if (this.userService.isModerator) {
            this.router.navigateByUrl('/admin');
        }
    }

    private getLocalStorageSortBy(): void {
        const sortBy = localStorage.getItem('users-sort');
        this.sortBy = sortBy ? sortBy : 'all';
    }

    private setPagesCount(): void {
        this.pagesCount = Math.ceil(this.allUsersCount / this.limit);
    }

    public getUsers(isAddToExciting: boolean = false): void {
        this.isLoading = !this.isLoadingMore ? true : false;
        const sortBy = (
            this.sortBy === 'all' ? null : this.sortBy
        ) as UserTypeEnum;

        this.userService
            .getUserWithPagination(this.limit, this.page, sortBy)
            .subscribe({
                next: (response) => {
                    if (isAddToExciting) {
                        response.users.forEach((user) => this.users.push(user));
                    } else {
                        this.users = response.users;
                    }

                    this.allUsersCount = response.allUsersCount;

                    this.setPagesCount();
                    this.isLoading = false;
                    this.isLoadingMore = false;
                },
                error: (_) => {
                    this.users = [];
                    this.isLoading = false;
                    this.isLoadingMore = false;
                },
            });
    }

    public onSelectionChange(): void {
        this.onPageChange(0);
        localStorage.setItem('users-sort', this.sortBy);
    }

    public onPageChange(pageNumber: number) {
        this.page = pageNumber;
        this.getUsers();
    }

    public onButtonMoreClick(): void {
        this.isLoadingMore = true;
        this.page++;
        this.getUsers(true);
    }

    private deleteUserByID(id: number): void {
        const userToDelete = this.users.filter((user) => user.id === id)[0];
        const indexUserToDelete = this.users.indexOf(userToDelete);
        this.users = this.users.filter((user) => user.id !== id);

        this.userService
            .deleteUserById(id)
            .pipe(take(1))
            .subscribe({
                next: (_) => {
                    const tempLimit = this.limit;
                    const tempPage = this.page;

                    this.limit = 1;
                    this.page = this.users.length;

                    this.isLoadingMore = true;
                    this.getUsers(true);

                    this.limit = tempLimit;
                    this.page = tempPage;

                    if (userToDelete.status === 'approved') {
                        this.userService.approvedUsersUpdated$.next(true);
                    }
                },
                error: (_) => {
                    this.users.splice(indexUserToDelete, 0, userToDelete);
                    alert(
                        `Something went wrong. Can't delete this user ${
                            indexUserToDelete + 1
                        }`
                    );
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
}
