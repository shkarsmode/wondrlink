import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChipInputComponent } from '../../../shared/components/chip-input/chip-input.component';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';
import { AdminSupportRequestService } from '../../services/support-request.service';
import { AdminListResponse, AdminSupportMessage, SupportMessageStatus, SupportMessageType, UpdateSupportMessageDto } from '../../types/support-request.types';

@Component({
    selector: 'app-admin-support-messages',
    standalone: true,
    imports: [CommonModule, FormsModule, ChipInputComponent],
    templateUrl: './support-messages.component.html',
    styleUrls: ['./support-messages.component.scss']
})
export class AdminSupportMessagesComponent implements OnInit {
    private adminSupportService = inject(AdminSupportRequestService);
    private cloudinaryService = inject(CloudinaryService);
    private cdr = inject(ChangeDetectorRef);

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
    editTags: string[] = [];
    saving = false;

    // Expanded preview state
    expandedPreviewOpen = false;
    expandedPreviewKind: 'text' | 'image' | 'video' | null = null;
    expandedPreviewTitle = '';
    expandedPreviewText = '';
    expandedPreviewUrl = '';
    expandedPreviewTransform = 'none';

    // Image rotation state
    imageRotation = 0; // degrees: 0, 90, 180, 270
    imageFlipH = false;
    imageFlipV = false;
    rotatedImageSaving = false;

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
        this.resetImageTransform();
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
            this.editTags = message.tags ? [...message.tags] : [];
        }
    }

    closeModal(): void {
        this.modalOpen = false;
        this.selectedMessage = null;
        this.closeExpandedPreview();
        this.resetImageTransform();
        this.editForm = {};
    }

    switchToEdit(): void {
        if (this.selectedMessage) {
            this.openModal(this.selectedMessage, 'edit');
        }
    }

    saveChanges(): void {
        if (!this.selectedMessage) return;
        
        this.editForm.tags = this.editTags;
        this.saving = true;
        this.adminSupportService.updateMessage(this.selectedMessage.id, this.editForm).subscribe({
            next: (updated) => {
                if (updated?.id) {
                    const index = this.messages.findIndex(m => m.id === updated.id);
                    if (index !== -1) {
                        this.messages[index] = updated;
                    }
                } else if (this.selectedMessage) {
                    const messageId = this.selectedMessage.id;
                    const index = this.messages.findIndex(m => m.id === messageId);
                    if (index !== -1) {
                        this.messages[index] = {
                            ...this.messages[index],
                            ...this.editForm,
                            tags: this.editTags,
                        };
                    }
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

    // ---- Image rotation/transform ----
    get imageTransformStyle(): string {
        const scaleX = this.imageFlipH ? -1 : 1;
        const scaleY = this.imageFlipV ? -1 : 1;
        return `scale(${scaleX}, ${scaleY}) rotate(${this.imageRotation}deg)`;
    }

    rotateLeft(): void {
        this.imageRotation = (this.imageRotation - 90 + 360) % 360;
    }

    rotateRight(): void {
        this.imageRotation = (this.imageRotation + 90) % 360;
    }

    flipHorizontal(): void {
        this.imageFlipH = !this.imageFlipH;
    }

    flipVertical(): void {
        this.imageFlipV = !this.imageFlipV;
    }

    resetImageTransform(): void {
        this.imageRotation = 0;
        this.imageFlipH = false;
        this.imageFlipV = false;
    }

    get hasImageTransform(): boolean {
        return this.imageRotation !== 0 || this.imageFlipH || this.imageFlipV;
    }

    saveImageTransform(): void {
        if (!this.selectedMessage?.mediaUrl || !this.hasImageTransform) return;

        const messageId = this.selectedMessage.id;
        const sourceMediaUrl = this.selectedMessage.mediaUrl;
        this.rotatedImageSaving = true;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const isRotated90 = this.imageRotation === 90 || this.imageRotation === 270;

            canvas.width = isRotated90 ? img.height : img.width;
            canvas.height = isRotated90 ? img.width : img.height;

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((this.imageRotation * Math.PI) / 180);
            ctx.scale(this.imageFlipH ? -1 : 1, this.imageFlipV ? -1 : 1);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

            canvas.toBlob((blob) => {
                if (!blob) {
                    this.rotatedImageSaving = false;
                    alert('Failed to transform image');
                    return;
                }
                const file = new File([blob], 'rotated.jpg', { type: 'image/jpeg' });
                this.cloudinaryService.uploadImageAndGetUrl(file).subscribe({
                    next: (res: any) => {
                        const url = res?.imageUrl?.secure_url || res?.imageUrl?.url || res?.imageUrl;
                        if (!url) {
                            this.rotatedImageSaving = false;
                            alert('Upload failed');
                            return;
                        }
                        this.adminSupportService.updateMessage(messageId, { mediaUrl: url }).subscribe({
                            next: (updated) => {
                                if (updated?.id) {
                                    const idx = this.messages.findIndex(m => m.id === updated.id);
                                    if (idx !== -1) this.messages[idx] = updated;
                                } else {
                                    const idx = this.messages.findIndex(m => m.id === messageId);
                                    if (idx !== -1) {
                                        this.messages[idx] = {
                                            ...this.messages[idx],
                                            mediaUrl: url,
                                        };
                                    }
                                }
                                if (this.selectedMessage?.id === messageId) {
                                    this.selectedMessage.mediaUrl = url;
                                    this.cdr.markForCheck();
                                }
                                this.resetImageTransform();
                                this.rotatedImageSaving = false;
                                this.cdr.markForCheck();
                            },
                            error: () => {
                                this.rotatedImageSaving = false;
                                alert('Failed to save rotated image');
                            }
                        });
                    },
                    error: () => {
                        this.rotatedImageSaving = false;
                        alert('Failed to upload rotated image');
                    }
                });
            }, 'image/jpeg', 0.92);
        };
        img.onerror = () => {
            this.rotatedImageSaving = false;
            alert('Failed to load image for transformation');
        };
        img.src = sourceMediaUrl;
    }

    // ---- Tags ----
    onTagsChange(tags: string[]): void {
        this.editTags = tags;
    }

    openTextPreview(text: string | undefined, title: string = 'Message Text'): void {
        const previewText = text?.trim();
        if (!previewText) return;

        this.expandedPreviewKind = 'text';
        this.expandedPreviewTitle = title;
        this.expandedPreviewText = previewText;
        this.expandedPreviewUrl = '';
        this.expandedPreviewTransform = 'none';
        this.expandedPreviewOpen = true;
    }

    openMediaPreview(
        mediaUrl: string | undefined,
        type: SupportMessageType | undefined,
        title: string = 'Submitted Media',
        transformStyle: string = 'none',
    ): void {
        if (!mediaUrl || !type) return;

        this.expandedPreviewKind = type === SupportMessageType.VIDEO ? 'video' : 'image';
        this.expandedPreviewTitle = title;
        this.expandedPreviewText = '';
        this.expandedPreviewUrl = mediaUrl;
        this.expandedPreviewTransform = transformStyle;
        this.expandedPreviewOpen = true;
    }

    closeExpandedPreview(): void {
        this.expandedPreviewOpen = false;
        this.expandedPreviewKind = null;
        this.expandedPreviewTitle = '';
        this.expandedPreviewText = '';
        this.expandedPreviewUrl = '';
        this.expandedPreviewTransform = 'none';
    }

    @HostListener('document:keydown.escape')
    handleEscapeKey(): void {
        if (this.expandedPreviewOpen) {
            this.closeExpandedPreview();
            return;
        }

        if (this.modalOpen) {
            this.closeModal();
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
