// src/app/services/submission.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface SubmissionListParams {
    page?: number;
    limit?: number;
    formType?: FormType;
    q?: string;
}

export interface SubmissionListResponse {
    items: Submission[];
    total: number;
    page: number;
    limit: number;
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

    public getAll(params?: SubmissionListParams): Observable<SubmissionListResponse> {
        let httpParams = new HttpParams();

        if (params?.page) {
            httpParams = httpParams.set('page', String(params.page));
        }

        if (params?.limit) {
            httpParams = httpParams.set('limit', String(params.limit));
        }

        if (params?.formType) {
            httpParams = httpParams.set('formType', params.formType);
        }

        if (params?.q?.trim()) {
            httpParams = httpParams.set('q', params.q.trim());
        }

        return this.http.get<SubmissionListResponse>(`${this.apiUrl}`, { params: httpParams });
    }

    // getById(id: number): Observable<Submission> {
    //     return this.http.get<Submission>(`${this.apiUrl}/${id}`);
    // }

    // delete(id: number): Observable<{ affected: number }> {
    //     return this.http.delete<{ affected: number }>(`${this.apiUrl}/delete/${id}`);
    // }
}
