import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminSupportRequestService } from '../../services/support-request.service';
import { AdminListResponse, AdminSupportMessage, SupportMessageStatus } from '../../types/support-request.types';

@Component({
    selector: 'app-admin-support-messages',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './support-messages.component.html',
    styleUrls: ['./support-messages.component.scss']
})
export class AdminSupportMessagesComponent implements OnInit {
    private adminSupportService = inject(AdminSupportRequestService);

    messages: AdminSupportMessage[] = [];
    loading = false;
    page = 1;
    limit = 20;
    status: SupportMessageStatus | undefined;
    sortBy = 'createdAt';
    sortOrder: 'ASC' | 'DESC' = 'DESC';
    total = 0;

    SupportMessageStatus = SupportMessageStatus;
    statusOptions = Object.values(SupportMessageStatus);

    ngOnInit(): void {
        this.loadMessages();
    }

    loadMessages(): void {
        this.loading = true;
        this.adminSupportService.listMessages(this.page, this.limit, this.status, this.sortBy, this.sortOrder)
            .subscribe({
                next: (response: AdminListResponse<AdminSupportMessage>) => {
                    this.messages = response.items;
                    this.total = response.total;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error loading messages:', err);
                    this.loading = false;
                }
            });
    }

    onStatusChange(): void {
        this.page = 1;
        this.loadMessages();
    }

    onSortChange(): void {
        this.page = 1;
        this.loadMessages();
    }

    onPrevPage(): void {
        if (this.page > 1) {
            this.page--;
            this.loadMessages();
        }
    }

    onNextPage(): void {
        if (this.page * this.limit < this.total) {
            this.page++;
            this.loadMessages();
        }
    }

    approveMessage(messageId: number): void {
        if (confirm('Approve this support message?')) {
            this.adminSupportService.approveMessage(messageId).subscribe({
                next: () => {
                    this.loadMessages();
                },
                error: (err) => console.error('Error approving message:', err)
            });
        }
    }

    rejectMessage(messageId: number): void {
        if (confirm('Reject this support message?')) {
            this.adminSupportService.rejectMessage(messageId).subscribe({
                next: () => {
                    this.loadMessages();
                },
                error: (err) => console.error('Error rejecting message:', err)
            });
        }
    }

    getStatusBadgeClass(status: SupportMessageStatus): string {
        switch (status) {
            case SupportMessageStatus.APPROVED:
                return 'badge-success';
            case SupportMessageStatus.PENDING_APPROVAL:
                return 'badge-warning';
            case SupportMessageStatus.REJECTED:
                return 'badge-danger';
            default:
                return 'badge-secondary';
        }
    }

    truncateMessage(message: string | undefined, length: number = 50): string {
        if (!message) return '-';
        return message.length > length ? message.substring(0, length) + '...' : message;
    }

    get totalPages(): number {
        return Math.ceil(this.total / this.limit);
    }
}
