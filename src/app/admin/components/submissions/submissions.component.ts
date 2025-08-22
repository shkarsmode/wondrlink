// src/app/admin/submissions/submissions-admin.component.ts
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, debounceTime, switchMap, takeUntil, tap } from 'rxjs';
import { FormType, Submission, SubmissionService } from '../../services/submission.service';
import { SubmissionJsonDialogComponent } from './submission-json-dialog/submission-json-dialog.component';
// import { SubmissionJsonDialogComponent } from './submission-json-dialog.component';

@Component({
    selector: 'app-submissions',
    templateUrl: './submissions.component.html',
    styleUrls: ['./submissions.component.scss'],
})
export class SubmissionsComponent implements OnInit, OnDestroy {
    displayedColumns = ['id', 'formType', 'email', 'city', 'createdAt', 'actions'];
    dataSource = new MatTableDataSource<Submission>([]);
    loading = false;

    page = 1;
    limit = 20;
    total = 0;

    readonly formTypes = Object.values(FormType);

    filterForm = this.fb.group({
        q: [''],
        formType: [''],
    });

    private destroy$ = new Subject<void>();
    private reload$ = new Subject<void>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private fb: FormBuilder,
        private api: SubmissionService,
        private dialog: MatDialog,
    ) { }

    ngOnInit(): void {
        this.filterForm.valueChanges
            .pipe(
                debounceTime(250),
                tap(() => (this.page = 1)),
                tap(() => this.reload$.next()),
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
                        q: this.filterForm.value.q || undefined,
                    }),
                ),
                takeUntil(this.destroy$),
            )
            .subscribe({
                next: (rows) => {
                    this.dataSource.data = rows || [];
                    this.dataSource.sort = this.sort;
                    this.dataSource.paginator = this.paginator;
                    this.loading = false;
                },
                error: () => (this.loading = false),
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

    onPage(e: PageEvent): void {
        this.page = e.pageIndex + 1;
        this.limit = e.pageSize;
        this.refresh();
    }

    objectKeys = Object.keys;

    onSort(e: Sort): void {
        // если нужна серверная сортировка — тут отправляй сорт-параметры на бек
    }

    openJson(row: Submission): void {
        this.dialog.open(SubmissionJsonDialogComponent, {
          width: '720px',
          data: row,
          autoFocus: false,
        });
    }

    copyEmail(email?: string | null): void {
        if (!email) return;
        navigator.clipboard?.writeText(email);
    }

    exportRow(row: Submission): void {
        const blob = new Blob([JSON.stringify(row, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `submission_${row.id}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // утилиты для вытягивания частых полей из JSON
    getEmail(row: Submission): string | null {
        const email = (row.data as any)?.email;
        return typeof email === 'string' ? email : null;
    }

    getCity(row: Submission): string | null {
        const city = (row.data as any)?.city;
        return typeof city === 'string' ? city : null;
    }

    asDate(iso?: string): string {
        return iso ? new Date(iso).toLocaleString() : '';
    }
}
