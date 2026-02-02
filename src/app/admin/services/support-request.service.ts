import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_PATH_API } from '../../shared/services/variables';
import { AdminListResponse, AdminSupportMessage, AdminSupportRequest, SupportMessageStatus, SupportRequestStatus } from '../types/support-request.types';

@Injectable({
    providedIn: 'root'
})
export class AdminSupportRequestService {
    private readonly supportPath = 'support-requests';
    private http = inject(HttpClient);
    private basePathApi = inject(BASE_PATH_API);
    private apiUrl = `${this.basePathApi}/${this.supportPath}`;

    // Support Requests
    public listRequests(
        page: number = 1,
        limit: number = 20,
        status?: SupportRequestStatus,
        sortBy: string = 'createdAt',
        sortOrder: 'ASC' | 'DESC' = 'DESC'
    ): Observable<AdminListResponse<AdminSupportRequest>> {
        const params: any = { page, limit, sortBy, sortOrder };
        if (status) params.status = status;
        return this.http.get<AdminListResponse<AdminSupportRequest>>(`${this.apiUrl}/admin/requests/list`, { params });
    }

    public getRequest(requestId: number): Observable<AdminSupportRequest & { messages: AdminSupportMessage[] }> {
        return this.http.get<AdminSupportRequest & { messages: AdminSupportMessage[] }>(`${this.apiUrl}/admin/requests/${requestId}`);
    }

    public approveRequest(requestId: number): Observable<{ success: boolean }> {
        return this.http.patch<{ success: boolean }>(`${this.apiUrl}/admin/requests/${requestId}/approve`, {});
    }

    public rejectRequest(requestId: number): Observable<{ success: boolean }> {
        return this.http.patch<{ success: boolean }>(`${this.apiUrl}/admin/requests/${requestId}/reject`, {});
    }

    // Support Messages
    public listMessages(
        page: number = 1,
        limit: number = 20,
        status?: SupportMessageStatus,
        sortBy: string = 'createdAt',
        sortOrder: 'ASC' | 'DESC' = 'DESC'
    ): Observable<AdminListResponse<AdminSupportMessage>> {
        const params: any = { page, limit, sortBy, sortOrder };
        if (status) params.status = status;
        return this.http.get<AdminListResponse<AdminSupportMessage>>(`${this.apiUrl}/admin/messages/list`, { params });
    }

    public approveMessage(messageId: number): Observable<{ success: boolean }> {
        return this.http.patch<{ success: boolean }>(`${this.apiUrl}/admin/messages/${messageId}/approve`, {});
    }

    public rejectMessage(messageId: number): Observable<{ success: boolean }> {
        return this.http.patch<{ success: boolean }>(`${this.apiUrl}/admin/messages/${messageId}/reject`, {});
    }
}
