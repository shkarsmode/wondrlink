import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { first, Observable, Subject, tap } from 'rxjs';
import { IUser } from 'src/app/shared/interfaces/IUser';
import { UserTypeEnum } from '../interfaces/UserTypeEnum';
import { UsersResponseDto } from '../interfaces/UsersResponse.dto';
import { BASE_PATH_API } from './variables';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    public profileUpdated$: Subject<boolean> = new Subject();
    public approvedUsersUpdated$: Subject<boolean> = new Subject();
    public country: Subject<string> = new Subject();

    public moderators: Array<string> = ['will.monlux@gmail.com'];
    public user: IUser;

    private readonly userPath: string = 'users';

    constructor(
        private http: HttpClient,
        @Inject(BASE_PATH_API) private basePathApi: string
    ) {
        this.getUser().pipe(first()).subscribe();
    }

    public getUser(): Observable<IUser> {
        return this.http
            .get<IUser>(`${this.basePathApi}/${this.userPath}/my`)
            .pipe(tap((user) => this.user = user), tap(user => console.log(user)));
    }

    public get isModerator(): boolean {
        return this.moderators.includes(this.user?.email);
    }

    public getActiveUsersCount(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(
            `${this.basePathApi}/${this.userPath}/count-of-approved-users`
        );
    }

    public updateUserAvatar(
        userId: number,
        avatarUrl: string
    ): Observable<{ affected: number }> {
        return this.http.put<{ affected: number }>(
            `${this.basePathApi}/${this.userPath}/update/avatar`,
            {
                userId,
                avatarUrl,
            }
        );
    }

    public deleteUserById(userId: number): Observable<{ affected: number }> {
        return this.http.delete<{ affected: number }>(
            `${this.basePathApi}/${this.userPath}/${userId}`
        );
    }

    public getUserWithPagination(
        limit: number,
        page: number,
        type: UserTypeEnum | null = null
    ): Observable<UsersResponseDto> {
        let query = `limit=${limit}&page=${page}`;
        if (type) query += `&type=${type}`;

        return this.http.get<UsersResponseDto>(
            `${this.basePathApi}/${this.userPath}/all?${query}`
        );
    }

    public getUserById(id: number): Observable<IUser> {
        return this.http.get<IUser>(
            `${this.basePathApi}/${this.userPath}/${id}`
        );
    }

    public updateUserById(
        id: number,
        body: IUser
    ): Observable<{ affected: number }> {
        return this.http.put<{ affected: number }>(
            `${this.basePathApi}/${this.userPath}/${id}`,
            body
        );
    }
}
