import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/materials/material.module';
import { ParsedAdministrativeAddress, parseAdministrativeAddress } from '../../../shared/helpers/google-parser.helper';
import { AdminDialogService } from '../../services/admin-dialog.service';
import { AdminSupportRequestService } from '../../services/support-request.service';
import { AdminListResponse, AdminSupportRequest, SupportRequestStatus, UpdateSupportRequestDto } from '../../types/support-request.types';

declare const google: any;

const GOOGLE_AUTOCOMPLETE_ATTR = 'data-google-autocomplete';

@Component({
    selector: 'app-admin-support-requests',
    standalone: true,
    imports: [CommonModule, FormsModule, MaterialModule],
    templateUrl: './support-requests.component.html',
    styleUrls: ['./support-requests.component.scss']
})
export class AdminSupportRequestsComponent implements OnInit, OnDestroy {
    readonly additionalNoteMaxLength = 2000;
    private adminSupportService = inject(AdminSupportRequestService);
    private adminDialog = inject(AdminDialogService);
    private zone = inject(NgZone);

    @ViewChild('locationInput') locationInputRef?: ElementRef<HTMLInputElement>;

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

    // Modal state
    modalOpen = false;
    modalMode: 'view' | 'edit' = 'view';
    selectedRequest: AdminSupportRequest | null = null;
    editForm: UpdateSupportRequestDto = {};
    saving = false;
    private gmapsAutocomplete?: any;
    private gmapsAcListener?: { remove?: () => void };

    ngOnInit(): void {
        this.loadRequests();
    }

    ngOnDestroy(): void {
        this.removeGoogleAutocomplete();
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

    openModal(request: AdminSupportRequest, mode: 'view' | 'edit' = 'view'): void {
        this.removeGoogleAutocomplete();
        this.selectedRequest = request;
        this.modalMode = mode;
        this.modalOpen = true;
        if (mode === 'edit') {
            this.editForm = {
                firstName: request.firstName,
                age: request.age,
                gender: request.gender,
                location: request.location,
                city: request.city,
                state: request.state,
                lat: request.lat,
                lng: request.lng,
                diagnosis: request.diagnosis,
                situation: request.situation,
                whoNeedsSupport: request.whoNeedsSupport,
                caregiverRelationship: request.caregiverRelationship,
                journeyStage: request.journeyStage,
                hospital: request.hospital,
                isAnonymous: request.isAnonymous,
                comfortZones: request.comfortZones ? [...request.comfortZones] : [],
                additionalNote: request.additionalNote,
                status: request.status,
            };

            setTimeout(() => this.initGoogleAutocomplete());
        }
    }

    closeModal(): void {
        this.removeGoogleAutocomplete();
        this.modalOpen = false;
        this.selectedRequest = null;
        this.editForm = {};
    }

    switchToEdit(): void {
        if (this.selectedRequest) {
            this.openModal(this.selectedRequest, 'edit');
        }
    }

    saveChanges(): void {
        if (!this.selectedRequest) return;

        if ((this.editForm.additionalNote?.length ?? 0) > this.additionalNoteMaxLength) {
            void this.adminDialog.notice({
                tone: 'warning',
                icon: 'edit_note',
                title: 'Additional note is too long',
                message: `Keep the note under ${this.additionalNoteMaxLength} characters.`,
                confirmText: 'Close',
            });
            return;
        }

        if (typeof this.editForm.additionalNote === 'string') {
            this.editForm = {
                ...this.editForm,
                additionalNote: this.editForm.additionalNote.trim().slice(0, this.additionalNoteMaxLength),
            };
        }
        
        this.saving = true;
        this.adminSupportService.updateRequest(this.selectedRequest.id, this.editForm).subscribe({
            next: (updated) => {
                const index = this.requests.findIndex(r => r.id === updated.id);
                if (index !== -1) {
                    this.requests[index] = updated;
                }
                this.saving = false;
                this.closeModal();
            },
            error: async (err) => {
                console.error('Error updating request:', err);
                this.saving = false;
                await this.adminDialog.notice({
                    tone: 'danger',
                    icon: 'error',
                    title: 'Could not save support request',
                    message: 'The changes were not saved.',
                    description: 'Please review the request details and try again.',
                    confirmText: 'Close',
                });
            }
        });
    }

    async approveRequest(requestId: number): Promise<void> {
        const confirmed = await this.adminDialog.confirm({
            tone: 'success',
            icon: 'verified',
            title: 'Approve support request?',
            message: 'This request will be marked as verified.',
            description: 'Approved requests can receive community support messages.',
            confirmText: 'Approve',
            cancelText: 'Cancel',
        });

        if (!confirmed) return;

        this.adminSupportService.approveRequest(requestId).subscribe({
            next: () => {
                this.loadRequests();
            },
            error: async (err) => {
                console.error('Error approving request:', err);
                await this.adminDialog.notice({
                    tone: 'danger',
                    icon: 'error',
                    title: 'Approve failed',
                    message: 'The support request could not be approved.',
                    confirmText: 'Close',
                });
            }
        });
    }

    async rejectRequest(requestId: number): Promise<void> {
        const confirmed = await this.adminDialog.confirm({
            tone: 'warning',
            icon: 'block',
            title: 'Reject support request?',
            message: 'This request will be marked as rejected.',
            description: 'Rejected requests will no longer be available on the public support experience.',
            confirmText: 'Reject',
            cancelText: 'Keep request',
        });

        if (!confirmed) return;

        this.adminSupportService.rejectRequest(requestId).subscribe({
            next: () => {
                this.loadRequests();
            },
            error: async (err) => {
                console.error('Error rejecting request:', err);
                await this.adminDialog.notice({
                    tone: 'danger',
                    icon: 'error',
                    title: 'Reject failed',
                    message: 'The support request could not be rejected.',
                    confirmText: 'Close',
                });
            }
        });
    }

    changeRequestStatus(requestId: number, newStatus: SupportRequestStatus): void {
        this.adminSupportService.changeRequestStatus(requestId, newStatus).subscribe({
            next: () => {
                this.loadRequests();
            },
            error: (err) => console.error('Error changing request status:', err)
        });
    }

    async deleteRequest(requestId: number): Promise<void> {
        const confirmed = await this.adminDialog.confirm({
            tone: 'danger',
            icon: 'delete_forever',
            title: 'Delete support request?',
            message: `Support request #${requestId} will be permanently removed.`,
            description: 'This action cannot be undone. All linked support messages will be removed as well.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
        });

        if (!confirmed) return;

        this.adminSupportService.deleteRequest(requestId).subscribe({
            next: () => {
                this.loadRequests();
            },
            error: async (err) => {
                console.error('Error deleting request:', err);
                await this.adminDialog.notice({
                    tone: 'danger',
                    icon: 'error',
                    title: 'Delete failed',
                    message: 'The support request could not be deleted.',
                    confirmText: 'Close',
                });
            }
        });
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

    getComfortZonesDisplay(zones?: string[]): string {
        return zones?.join(', ') || '-';
    }

    getStatusFieldClass(status: SupportRequestStatus | undefined | null): string {
        switch (status) {
            case SupportRequestStatus.VERIFIED:
                return 'is-verified';
            case SupportRequestStatus.PENDING:
                return 'is-pending';
            case SupportRequestStatus.PENDING_APPROVAL:
                return 'is-pending-approval';
            case SupportRequestStatus.REJECTED:
                return 'is-rejected';
            case SupportRequestStatus.CLOSED:
                return 'is-closed';
            default:
                return '';
        }
    }

    private initGoogleAutocomplete(): void {
        const input = this.locationInputRef?.nativeElement ?? null;

        if (!input) return;
        if (!(window as any).google?.maps?.places?.Autocomplete) return;
        if (input.getAttribute(GOOGLE_AUTOCOMPLETE_ATTR)) return;

        this.gmapsAutocomplete = new google.maps.places.Autocomplete(input, {
            types: ['(cities)'],
            fields: ['place_id', 'name', 'formatted_address', 'geometry', 'address_components'],
        });

        input.setAttribute(GOOGLE_AUTOCOMPLETE_ATTR, 'true');

        this.gmapsAcListener = this.gmapsAutocomplete.addListener('place_changed', () => {
            const place = this.gmapsAutocomplete?.getPlace();

            if (!place) return;

            const lat: number | undefined = place.geometry?.location?.lat?.() ?? undefined;
            const lng: number | undefined = place.geometry?.location?.lng?.() ?? undefined;
            const components = (place.address_components || []) as any[];
            const parsed: ParsedAdministrativeAddress = parseAdministrativeAddress(components);
            const stateShort = this.getAddressComponentShortName(components, 'administrative_area_level_1');
            const fallbackFormatted: string = place.formatted_address || place.name || '';

            this.zone.run(() => {
                this.editForm = {
                    ...this.editForm,
                    location: this.buildLocationLabel(parsed, stateShort, fallbackFormatted),
                    city: parsed.city ?? this.editForm.city,
                    state: stateShort || parsed.state || this.editForm.state,
                    lat,
                    lng,
                };
            });
        });
    }

    private getAddressComponentShortName(components: any[], type: string): string | undefined {
        const component = components.find((item) => Array.isArray(item?.types) && item.types.includes(type));
        return component?.short_name ?? undefined;
    }

    private buildLocationLabel(
        parsed: ParsedAdministrativeAddress,
        stateShort: string | undefined,
        fallbackFormatted: string,
    ): string {
        const city = parsed.city?.trim();
        const state = stateShort?.trim() || parsed.state?.trim();

        if (city && state) {
            return `${city}, ${state}`;
        }

        if (city) {
            return city;
        }

        return fallbackFormatted;
    }

    private removeGoogleAutocomplete(): void {
        if (typeof window === 'undefined') return;

        this.gmapsAcListener?.remove?.();
        this.gmapsAcListener = undefined;

        if (this.gmapsAutocomplete && 'event' in google.maps) {
            google.maps.event.clearInstanceListeners(this.gmapsAutocomplete);
        }

        this.gmapsAutocomplete = undefined;

        const input = this.locationInputRef?.nativeElement ?? null;
        input?.removeAttribute(GOOGLE_AUTOCOMPLETE_ATTR);

        document.querySelectorAll('.pac-container').forEach((element) => element.remove());
    }
}
