import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, debounceTime, switchMap, takeUntil, tap } from 'rxjs';
import {
    FormType,
    Submission,
    SubmissionListResponse,
    SubmissionService,
} from '../../services/submission.service';
import { SubmissionJsonDialogComponent } from './submission-json-dialog/submission-json-dialog.component';

@Component({
    selector: 'app-submissions',
    templateUrl: './submissions.component.html',
    styleUrls: ['./submissions.component.scss'],
})
export class SubmissionsComponent implements OnInit, OnDestroy {
    displayedColumns = ['id', 'submission', 'details', 'createdAt', 'actions'];
    dataSource = new MatTableDataSource<Submission>([]);
    loading = false;

    page = 1;
    limit = 20;
    total = 0;
    readonly pageSizeOptions = [10, 20, 50];
    readonly formTypes = Object.values(FormType);

    filterForm = this.fb.group({
        q: [''],
        formType: [''],
    });

    private destroy$ = new Subject<void>();
    private reload$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private api: SubmissionService,
        private dialog: MatDialog,
    ) { }

    ngOnInit(): void {
        this.filterForm.valueChanges
            .pipe(
                debounceTime(250),
                tap(() => {
                    this.page = 1;
                    this.reload$.next();
                }),
                takeUntil(this.destroy$),
            )
            .subscribe();

        this.reload$
            .pipe(
                tap(() => (this.loading = true)),
                switchMap(() =>
                    this.api.getAll({
                        page: this.page,
                        limit: this.limit,
                        formType: (this.filterForm.value.formType as FormType) || undefined,
                        q: this.filterForm.value.q?.trim() || undefined,
                    }),
                ),
                takeUntil(this.destroy$),
            )
            .subscribe({
                next: (response: SubmissionListResponse) => {
                    this.dataSource.data = response.items ?? [];
                    this.total = response.total ?? 0;
                    this.page = response.page ?? this.page;
                    this.limit = response.limit ?? this.limit;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                },
            });

        this.reload$.next();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    refresh(): void {
        this.reload$.next();
    }

    onPage(event: PageEvent): void {
        this.page = event.pageIndex + 1;
        this.limit = event.pageSize;
        this.refresh();
    }

    openJson(row: Submission): void {
        this.dialog.open(SubmissionJsonDialogComponent, {
            width: '720px',
            data: row,
            autoFocus: false,
        });
    }

    copyEmail(email?: string | null): void {
        if (!email) {
            return;
        }

        navigator.clipboard?.writeText(email);
    }

    exportRow(row: Submission): void {
        const blob = new Blob([JSON.stringify(row, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `submission_${row.id}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    clearFilters(): void {
        this.filterForm.reset({ q: '', formType: '' });
    }

    getEmail(row: Submission): string | null {
        const email = row.data?.['email'];
        return typeof email === 'string' ? email : null;
    }

    getPrimaryName(row: Submission): string {
        const data = row.data ?? {};
        const value = data['firstName']
            ?? data['contactPerson']
            ?? data['organizationName']
            ?? data['fullName'];

        return typeof value === 'string' && value.trim() ? value : 'Unnamed submission';
    }

    getSecondaryLabel(row: Submission): string | null {
        const organizationName = row.data?.['organizationName'];
        if (typeof organizationName === 'string' && organizationName.trim()) {
            return organizationName;
        }

        const submissionCategory = row.data?.['submissionCategory'];
        if (typeof submissionCategory === 'string' && submissionCategory.trim()) {
            return submissionCategory.replace(/_/g, ' ');
        }

        return null;
    }

    getSourcePage(row: Submission): string | null {
        const sourcePage = row.data?.['sourcePage'];
        return typeof sourcePage === 'string' && sourcePage.trim() ? sourcePage : null;
    }

    getCity(row: Submission): string | null {
        const city = row.data?.['city'];
        return typeof city === 'string' && city.trim() ? city : null;
    }

    getMessage(row: Submission): string | null {
        const message = row.data?.['message'];
        return typeof message === 'string' && message.trim() ? message : null;
    }

    getLogoUrl(row: Submission): string | null {
        const logoUrl = row.data?.['logoUrl'];
        return typeof logoUrl === 'string' && logoUrl.trim() ? logoUrl : null;
    }

    getVisibleCount(): number {
        return this.dataSource.data.length;
    }

    asDate(iso?: string): string {
        return iso ? new Date(iso).toLocaleString() : '';
    }
}
