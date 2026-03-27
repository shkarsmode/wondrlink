import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChipInputComponent } from '../../../shared/components/chip-input/chip-input.component';
import { MaterialModule } from '../../../shared/materials/material.module';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';
import { AdminDialogService } from '../../services/admin-dialog.service';
import { AdminSupportRequestService } from '../../services/support-request.service';
import { AdminListResponse, AdminSupportMessage, SupportMessageStatus, SupportMessageType, UpdateSupportMessageDto } from '../../types/support-request.types';

@Component({
    selector: 'app-admin-support-messages',
    standalone: true,
    imports: [CommonModule, FormsModule, ChipInputComponent, MaterialModule],
    templateUrl: './support-messages.component.html',
    styleUrls: ['./support-messages.component.scss']
})
export class AdminSupportMessagesComponent implements OnInit {
    private adminSupportService = inject(AdminSupportRequestService);
    private cloudinaryService = inject(CloudinaryService);
    private cdr = inject(ChangeDetectorRef);
    private adminDialog = inject(AdminDialogService);
    private route = inject(ActivatedRoute);
    readonly genericGalleryPath = '/api/voices/approved';
    private pendingMessageIdFromRoute: number | null = null;

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
        const messageId = Number(this.route.snapshot.queryParamMap.get('messageId'));
        this.pendingMessageIdFromRoute = Number.isFinite(messageId) && messageId > 0 ? messageId : null;
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
                    this.openMessageFromRouteIfNeeded();
                },
                error: (err) => {
                    console.error('Error loading messages:', err);
                    this.loading = false;
                }
            });
    }

    private openMessageFromRouteIfNeeded(): void {
        if (!this.pendingMessageIdFromRoute) {
            return;
        }

        const messageId = this.pendingMessageIdFromRoute;
        const existing = this.messages.find((message) => message.id === messageId);

        if (existing) {
            this.pendingMessageIdFromRoute = null;
            this.openModal(existing, 'view');
            return;
        }

        this.adminSupportService.getMessage(messageId).subscribe({
            next: (message) => {
                this.pendingMessageIdFromRoute = null;
                this.openModal(message, 'view');
            },
            error: (err) => {
                console.error('Error loading message from route:', err);
                this.pendingMessageIdFromRoute = null;
            },
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
                isGeneric: message.isGeneric,
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
            error: async (err) => {
                console.error('Error updating message:', err);
                this.saving = false;
                await this.adminDialog.notice({
                    tone: 'danger',
                    icon: 'error',
                    title: 'Could not save support message',
                    message: 'The changes were not saved.',
                    description: 'Please review the fields and try again.',
                    confirmText: 'Close',
                });
            }
        });
    }

    async approveMessage(messageId: number): Promise<void> {
        const confirmed = await this.adminDialog.confirm({
            tone: 'success',
            icon: 'verified',
            title: 'Approve support message?',
            message: 'This will mark the message as approved.',
            description: 'If this message is marked as Generic, its linked gallery item will stay in sync with this approval status.',
            confirmText: 'Approve',
            cancelText: 'Cancel',
        });

        if (!confirmed) return;

        this.adminSupportService.approveMessage(messageId).subscribe({
            next: () => {
                this.loadMessages();
            },
            error: async (err) => {
                console.error('Error approving message:', err);
                await this.adminDialog.notice({
                    tone: 'danger',
                    icon: 'error',
                    title: 'Approve failed',
                    message: 'The support message could not be approved.',
                    confirmText: 'Close',
                });
            }
        });
    }

    async rejectMessage(messageId: number): Promise<void> {
        const confirmed = await this.adminDialog.confirm({
            tone: 'warning',
            icon: 'block',
            title: 'Reject support message?',
            message: 'This will mark the message as rejected.',
            description: 'Linked Generic gallery content will also follow this rejected status.',
            confirmText: 'Reject',
            cancelText: 'Keep message',
        });

        if (!confirmed) return;

        this.adminSupportService.rejectMessage(messageId).subscribe({
            next: () => {
                this.loadMessages();
            },
            error: async (err) => {
                console.error('Error rejecting message:', err);
                await this.adminDialog.notice({
                    tone: 'danger',
                    icon: 'error',
                    title: 'Reject failed',
                    message: 'The support message could not be rejected.',
                    confirmText: 'Close',
                });
            }
        });
    }

    changeMessageStatus(messageId: number, newStatus: SupportMessageStatus): void {
        this.adminSupportService.changeMessageStatus(messageId, newStatus).subscribe({
            next: () => {
                this.loadMessages();
            },
            error: (err) => console.error('Error changing message status:', err)
        });
    }

    async deleteMessage(message: AdminSupportMessage): Promise<void> {
        const description = message.isGeneric
            ? 'This action cannot be undone. The linked Generic gallery item will also be removed from Wondrvoices.'
            : 'This action cannot be undone.';

        const confirmed = await this.adminDialog.confirm({
            tone: 'danger',
            icon: 'delete_forever',
            title: 'Delete support message?',
            message: `Support message #${message.id} will be permanently removed.`,
            description,
            confirmText: 'Delete',
            cancelText: 'Cancel',
        });

        if (!confirmed) return;

        this.adminSupportService.deleteMessage(message.id).subscribe({
            next: () => {
                this.loadMessages();
            },
            error: async (err) => {
                console.error('Error deleting message:', err);
                await this.adminDialog.notice({
                    tone: 'danger',
                    icon: 'error',
                    title: 'Delete failed',
                    message: 'The support message could not be deleted.',
                    confirmText: 'Close',
                });
            }
        });
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
                    void this.adminDialog.notice({
                        tone: 'danger',
                        icon: 'image_not_supported',
                        title: 'Image transform failed',
                        message: 'The rotated image could not be created.',
                        confirmText: 'Close',
                    });
                    return;
                }
                const file = new File([blob], 'rotated.jpg', { type: 'image/jpeg' });
                this.cloudinaryService.uploadImageAndGetUrl(file).subscribe({
                    next: (res: any) => {
                        const url = res?.imageUrl?.secure_url || res?.imageUrl?.url || res?.imageUrl;
                        if (!url) {
                            this.rotatedImageSaving = false;
                            void this.adminDialog.notice({
                                tone: 'danger',
                                icon: 'cloud_off',
                                title: 'Upload failed',
                                message: 'The transformed image did not upload successfully.',
                                confirmText: 'Close',
                            });
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
                                void this.adminDialog.notice({
                                    tone: 'danger',
                                    icon: 'error',
                                    title: 'Save failed',
                                    message: 'The updated rotated image could not be saved.',
                                    confirmText: 'Close',
                                });
                            }
                        });
                    },
                    error: () => {
                        this.rotatedImageSaving = false;
                        void this.adminDialog.notice({
                            tone: 'danger',
                            icon: 'cloud_upload',
                            title: 'Upload failed',
                            message: 'The rotated image could not be uploaded.',
                            confirmText: 'Close',
                        });
                    }
                });
            }, 'image/jpeg', 0.92);
        };
        img.onerror = () => {
            this.rotatedImageSaving = false;
            void this.adminDialog.notice({
                tone: 'danger',
                icon: 'broken_image',
                title: 'Image load failed',
                message: 'The original image could not be loaded for editing.',
                confirmText: 'Close',
            });
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

    canBeGeneric(message: AdminSupportMessage | null | undefined): boolean {
        return !!message?.mediaUrl && message.type === SupportMessageType.IMAGE;
    }

    genericStatusLabel(message: AdminSupportMessage): string {
        if (!message.isGeneric) {
            return 'Not in gallery';
        }

        return message.genericVoiceId ? `Voice #${message.genericVoiceId}` : 'Linked';
    }

    genericHint(
        message: AdminSupportMessage | null | undefined,
        statusOverride?: SupportMessageStatus | undefined,
    ): string {
        if (!message) {
            return '';
        }

        if (!this.canBeGeneric(message)) {
            return `Only image support messages with media can be sent to ${this.genericGalleryPath}.`;
        }

        if ((statusOverride ?? message.status) === SupportMessageStatus.APPROVED) {
            return `This will sync into ${this.genericGalleryPath}.`;
        }

        return `A linked voice will be created now and will become public in ${this.genericGalleryPath} once the message status is approved.`;
    }

    getStatusFieldClass(status: SupportMessageStatus | undefined | null): string {
        switch (status) {
            case SupportMessageStatus.APPROVED:
                return 'is-approved';
            case SupportMessageStatus.PENDING_APPROVAL:
                return 'is-pending-approval';
            case SupportMessageStatus.REJECTED:
                return 'is-rejected';
            default:
                return '';
        }
    }
}
