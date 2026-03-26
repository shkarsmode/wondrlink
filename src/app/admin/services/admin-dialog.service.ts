import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import {
    AdminActionDialogComponent,
    AdminActionDialogData,
} from '../components/admin-action-dialog/admin-action-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class AdminDialogService {
    private readonly dialog = inject(MatDialog);

    async confirm(data: AdminActionDialogData): Promise<boolean> {
        const dialogRef = this.dialog.open(AdminActionDialogComponent, {
            width: 'min(520px, calc(100vw - 24px))',
            maxWidth: '520px',
            autoFocus: false,
            restoreFocus: true,
            role: 'alertdialog',
            panelClass: 'admin-action-dialog-panel',
            backdropClass: 'admin-action-dialog-backdrop',
            data: {
                kind: 'confirm',
                tone: data.tone ?? 'info',
                cancelText: data.cancelText ?? 'Cancel',
                confirmText: data.confirmText ?? 'Continue',
                ...data,
            },
        });

        return (await firstValueFrom(dialogRef.afterClosed())) === true;
    }

    async notice(data: AdminActionDialogData): Promise<void> {
        const dialogRef = this.dialog.open(AdminActionDialogComponent, {
            width: 'min(520px, calc(100vw - 24px))',
            maxWidth: '520px',
            autoFocus: false,
            restoreFocus: true,
            role: 'dialog',
            panelClass: 'admin-action-dialog-panel',
            backdropClass: 'admin-action-dialog-backdrop',
            data: {
                kind: 'notice',
                tone: data.tone ?? 'info',
                confirmText: data.confirmText ?? 'OK',
                ...data,
            },
        });

        await firstValueFrom(dialogRef.afterClosed());
    }
}
