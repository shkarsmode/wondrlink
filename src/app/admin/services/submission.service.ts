// src/app/services/submission.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_PATH_API } from '../../shared/services/variables';

export enum FormType {
    JoinSpot = 'join_spot',
    GetInvolved = 'get_involved',
    Contact = 'contact',
    Custom = 'custom',
}

export interface Submission {
    id?: number;
    formType: FormType;
    data: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;
}


@Injectable({
    providedIn: 'root'
})
export class SubmissionService {
    private readonly submissionPath: string = 'submission';
    private http: HttpClient = inject(HttpClient);
    private basePathApi = inject(BASE_PATH_API);
    private apiUrl = `${this.basePathApi}/${this.submissionPath}`;

    public create(submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>): Observable<Submission> {
        return this.http.post<Submission>(`${this.apiUrl}`, submission);
    }

    public getAll(params?: { page?: number; limit?: number; formType?: FormType; q?: string }): Observable<Submission[]> {
        return this.http.get<Submission[]>(`${this.apiUrl}`, { params: params as any });
    }

    // getById(id: number): Observable<Submission> {
    //     return this.http.get<Submission>(`${this.apiUrl}/${id}`);
    // }

    // delete(id: number): Observable<{ affected: number }> {
    //     return this.http.delete<{ affected: number }>(`${this.apiUrl}/delete/${id}`);
    // }
}
