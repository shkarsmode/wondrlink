import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type AdminActionDialogTone = 'info' | 'success' | 'warning' | 'danger';
export type AdminActionDialogKind = 'confirm' | 'notice';

export interface AdminActionDialogData {
    kind?: AdminActionDialogKind;
    tone?: AdminActionDialogTone;
    title: string;
    message: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    icon?: string;
}

@Component({
    selector: 'app-admin-action-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-action-dialog.component.html',
    styleUrl: './admin-action-dialog.component.scss',
})
export class AdminActionDialogComponent {
    readonly data = inject<AdminActionDialogData>(MAT_DIALOG_DATA);
    private readonly dialogRef = inject(MatDialogRef<AdminActionDialogComponent, boolean>);

    readonly isConfirm = computed(() => this.data.kind !== 'notice');

    readonly resolvedIcon = computed(() => {
        if (this.data.icon) {
            return this.data.icon;
        }

        switch (this.data.tone) {
            case 'success':
                return 'check_circle';
            case 'warning':
                return 'warning';
            case 'danger':
                return 'delete';
            default:
                return 'info';
        }
    });

    close(result: boolean): void {
        this.dialogRef.close(result);
    }
}
