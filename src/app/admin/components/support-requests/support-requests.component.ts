import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminSupportRequestService } from '../../services/support-request.service';
import { AdminListResponse, AdminSupportRequest, SupportRequestStatus } from '../../types/support-request.types';

@Component({
    selector: 'app-admin-support-requests',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './support-requests.component.html',
    styleUrls: ['./support-requests.component.scss']
})
export class AdminSupportRequestsComponent implements OnInit {
    private adminSupportService = inject(AdminSupportRequestService);

    requests: AdminSupportRequest[] = [];
    loading = false;
    page = 1;
    limit = 20;
    status: SupportRequestStatus | undefined;
    sortBy = 'createdAt';
    sortOrder: 'ASC' | 'DESC' = 'DESC';
    total = 0;

    SupportRequestStatus = SupportRequestStatus;
    statusOptions = Object.values(SupportRequestStatus);

    ngOnInit(): void {
        this.loadRequests();
    }

    loadRequests(): void {
        this.loading = true;
        this.adminSupportService.listRequests(this.page, this.limit, this.status, this.sortBy, this.sortOrder)
            .subscribe({
                next: (response: AdminListResponse<AdminSupportRequest>) => {
                    this.requests = response.items;
                    this.total = response.total;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error loading requests:', err);
                    this.loading = false;
                }
            });
    }

    onStatusChange(): void {
        this.page = 1;
        this.loadRequests();
    }

    onSortChange(): void {
        this.page = 1;
        this.loadRequests();
    }

    onPrevPage(): void {
        if (this.page > 1) {
            this.page--;
            this.loadRequests();
        }
    }

    onNextPage(): void {
        if (this.page * this.limit < this.total) {
            this.page++;
            this.loadRequests();
        }
    }

    approveRequest(requestId: number): void {
        if (confirm('Approve this support request?')) {
            this.adminSupportService.approveRequest(requestId).subscribe({
                next: () => {
                    this.loadRequests();
                },
                error: (err) => console.error('Error approving request:', err)
            });
        }
    }

    rejectRequest(requestId: number): void {
        if (confirm('Reject this support request?')) {
            this.adminSupportService.rejectRequest(requestId).subscribe({
                next: () => {
                    this.loadRequests();
                },
                error: (err) => console.error('Error rejecting request:', err)
            });
        }
    }

    changeRequestStatus(requestId: number, newStatus: SupportRequestStatus): void {
        this.adminSupportService.changeRequestStatus(requestId, newStatus).subscribe({
            next: () => {
                this.loadRequests();
            },
            error: (err) => console.error('Error changing request status:', err)
        });
    }

    deleteRequest(requestId: number): void {
        if (confirm('Delete this support request? This action cannot be undone.')) {
            this.adminSupportService.deleteRequest(requestId).subscribe({
                next: () => {
                    this.loadRequests();
                },
                error: (err) => console.error('Error deleting request:', err)
            });
        }
    }

    getStatusBadgeClass(status: SupportRequestStatus): string {
        switch (status) {
            case SupportRequestStatus.VERIFIED:
                return 'badge-success';
            case SupportRequestStatus.PENDING:
            case SupportRequestStatus.PENDING_APPROVAL:
                return 'badge-warning';
            case SupportRequestStatus.REJECTED:
                return 'badge-danger';
            default:
                return 'badge-secondary';
        }
    }

    get totalPages(): number {
        return Math.ceil(this.total / this.limit);
    }
}
