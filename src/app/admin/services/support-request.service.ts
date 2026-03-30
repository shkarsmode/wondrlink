import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BASE_PATH_API } from '../../shared/services/variables';
import { AdminListResponse, AdminSupportMessage, AdminSupportRequest, SupportMessageStatus, SupportRequestStatus, UpdateSupportMessageDto, UpdateSupportRequestDto } from '../types/support-request.types';

type AdminSupportRequestResponse = Omit<AdminSupportRequest, 'supportCount'> & {
    supportCount?: number;
};

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
        return this.http
            .get<AdminListResponse<AdminSupportRequestResponse>>(`${this.apiUrl}/admin/requests/list`, { params })
            .pipe(
                map(response => ({
                    ...response,
                    items: response.items.map(item => this.normalizeRequest(item)),
                }))
            );
    }

    public getRequest(requestId: number): Observable<AdminSupportRequest & { messages: AdminSupportMessage[] }> {
        return this.http
            .get<AdminSupportRequestResponse & { messages: AdminSupportMessage[] }>(`${this.apiUrl}/admin/requests/${requestId}`)
            .pipe(map(response => ({ ...response, ...this.normalizeRequest(response) })));
    }

    public approveRequest(requestId: number): Observable<{ success: boolean }> {
        return this.http.patch<{ success: boolean }>(`${this.apiUrl}/admin/requests/${requestId}/approve`, {});
    }

    public rejectRequest(requestId: number): Observable<{ success: boolean }> {
        return this.http.patch<{ success: boolean }>(`${this.apiUrl}/admin/requests/${requestId}/reject`, {});
    }

    public updateRequest(requestId: number, data: UpdateSupportRequestDto): Observable<AdminSupportRequest> {
        return this.http
            .patch<AdminSupportRequestResponse>(`${this.apiUrl}/admin/requests/${requestId}`, data)
            .pipe(map(response => this.normalizeRequest(response)));
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

    public getMessage(messageId: number): Observable<AdminSupportMessage> {
        return this.http.get<AdminSupportMessage>(`${this.apiUrl}/admin/messages/${messageId}`);
    }

    public approveMessage(messageId: number): Observable<{ success: boolean }> {
        return this.http.patch<{ success: boolean }>(`${this.apiUrl}/admin/messages/${messageId}/approve`, {});
    }

    public rejectMessage(messageId: number): Observable<{ success: boolean }> {
        return this.http.patch<{ success: boolean }>(`${this.apiUrl}/admin/messages/${messageId}/reject`, {});
    }

    public updateMessage(messageId: number, data: UpdateSupportMessageDto): Observable<AdminSupportMessage> {
        return this.http.patch<AdminSupportMessage>(`${this.apiUrl}/admin/messages/${messageId}`, data);
    }

    public changeRequestStatus(requestId: number, status: SupportRequestStatus): Observable<{ success: boolean }> {
        return this.http.patch<{ success: boolean }>(`${this.apiUrl}/admin/requests/${requestId}/status`, { status });
    }

    public changeMessageStatus(messageId: number, status: SupportMessageStatus): Observable<{ success: boolean }> {
        return this.http.patch<{ success: boolean }>(`${this.apiUrl}/admin/messages/${messageId}/status`, { status });
    }

    public deleteRequest(requestId: number): Observable<{ success: boolean }> {
        return this.http.delete<{ success: boolean }>(`${this.apiUrl}/admin/requests/${requestId}`);
    }

    public deleteMessage(messageId: number): Observable<{ success: boolean }> {
        return this.http.delete<{ success: boolean }>(`${this.apiUrl}/admin/messages/${messageId}`);
    }

    private normalizeRequest(request: AdminSupportRequestResponse): AdminSupportRequest {
        return {
            ...request,
            supportCount: request.supportCount ?? request.comments ?? 0,
        };
    }
}
