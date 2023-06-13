import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser } from 'src/interfaces/IUser';
import { BASE_PATH_API } from './variables';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private readonly userPath: string = 'users';

    constructor(
        private http: HttpClient,
        @Inject(BASE_PATH_API) private basePathApi: string
    ) { }


    public getUser(): Observable<IUser> {
        return this.http.get<IUser>(
            `${this.basePathApi}/${this.userPath}/my`
        );
    }

    public updateUserAvatar(userId: number, avatarUrl: string): Observable<{ affected: number }> {
        return this.http.put<{ affected: number }>(
            `${this.basePathApi}/${this.userPath}/update/avatar`,
            {
                userId,
                avatarUrl
            }
        );
    }
}
