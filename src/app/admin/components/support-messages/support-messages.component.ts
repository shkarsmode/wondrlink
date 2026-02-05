import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminSupportRequestService } from '../../services/support-request.service';
import { AdminListResponse, AdminSupportMessage, SupportMessageStatus, UpdateSupportMessageDto } from '../../types/support-request.types';

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

    // Modal state
    modalOpen = false;
    modalMode: 'view' | 'edit' = 'view';
    selectedMessage: AdminSupportMessage | null = null;
    editForm: UpdateSupportMessageDto = {};
    saving = false;

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

    openModal(message: AdminSupportMessage, mode: 'view' | 'edit' = 'view'): void {
        this.selectedMessage = message;
        this.modalMode = mode;
        this.modalOpen = true;
        if (mode === 'edit') {
            this.editForm = {
                fromName: message.fromName,
                email: message.email,
                location: message.location,
                city: message.city,
                organization: message.organization,
                message: message.message,
                anonymous: message.anonymous,
                status: message.status,
            };
        }
    }

    closeModal(): void {
        this.modalOpen = false;
        this.selectedMessage = null;
        this.editForm = {};
    }

    switchToEdit(): void {
        if (this.selectedMessage) {
            this.openModal(this.selectedMessage, 'edit');
        }
    }

    saveChanges(): void {
        if (!this.selectedMessage) return;
        
        this.saving = true;
        this.adminSupportService.updateMessage(this.selectedMessage.id, this.editForm).subscribe({
            next: (updated) => {
                const index = this.messages.findIndex(m => m.id === updated.id);
                if (index !== -1) {
                    this.messages[index] = updated;
                }
                this.saving = false;
                this.closeModal();
            },
            error: (err) => {
                console.error('Error updating message:', err);
                this.saving = false;
                alert('Failed to save changes');
            }
        });
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

    changeMessageStatus(messageId: number, newStatus: SupportMessageStatus): void {
        this.adminSupportService.changeMessageStatus(messageId, newStatus).subscribe({
            next: () => {
                this.loadMessages();
            },
            error: (err) => console.error('Error changing message status:', err)
        });
    }

    deleteMessage(messageId: number): void {
        if (confirm('Delete this support message? This action cannot be undone.')) {
            this.adminSupportService.deleteMessage(messageId).subscribe({
                next: () => {
                    this.loadMessages();
                },
                error: (err) => console.error('Error deleting message:', err)
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
