import { A11yModule } from "@angular/cdk/a11y";
import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    computed,
    effect,
    inject,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IVoice, VoiceStatus, VoicesListResponse } from '../../../shared/interfaces/voices';
import { VoicesService } from '../../services/voices.service';

type StatusFilter = 'all' | VoiceStatus;

@Component({
    selector: 'admin-voices-table',
    standalone: true,
    imports: [CommonModule, A11yModule],
    templateUrl: './voices.component.html',
    styleUrl: './voices.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoicesComponent {
    private readonly svc = inject(VoicesService);
    private readonly destroyRef = inject(DestroyRef);

    // --- UI state
    public statusFilter = signal<StatusFilter>(VoiceStatus.Pending); // стартуем с "pending"
    public page = signal(1);
    public limit = signal(20);
    public search = signal('');

    // --- data
    public loading = signal(false);
    public items = signal<IVoice[]>([]);
    public total = signal(0);

    public readonly statusTabs: { label: string; value: StatusFilter }[] = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: VoiceStatus.Pending },
        { label: 'Approved', value: VoiceStatus.Approved },
        { label: 'Rejected', value: VoiceStatus.Rejected },
    ];

    public readonly statusActions: { label: string; value: VoiceStatus; class: string }[] = [
        { label: 'Approve', value: VoiceStatus.Approved, class: 'approve' },
        { label: 'Reject', value: VoiceStatus.Rejected, class: 'reject' },
        { label: 'Set Pending', value: VoiceStatus.Pending, class: 'pending' },
    ];

    // client-side search по полям
    public filtered = computed(() => {
        const q = this.search().trim().toLowerCase();
        const base = this.items();
        if (!q) return base;

        const match = (v: IVoice) => {
            const bag = [
                v.firstName ?? '',
                v.email ?? '',
                v.location ?? '',
                v.creditTo ?? '',
                v.note ?? '',
                ...(v.what ?? []),
                ...(v.express ?? []),
            ].join(' ').toLowerCase();
            return bag.includes(q);
        };
        return base.filter(match);
    });

    public onInput(event: Event): void {
        this.search.set((event.target as HTMLInputElement).value)
    }

    public totalPages = computed(() => {
        const t = this.total();
        const l = this.limit();
        return Math.max(1, Math.ceil(t / l));
    });

    constructor() {
        effect(() => {
            const p = this.page();
            const l = this.limit();
            const f = this.statusFilter();

            this.loading.set(true);
            this.svc
                .getVoices(l, p, f === 'all' ? undefined : f)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: (res: VoicesListResponse) => {
                        this.items.set(res.items);
                        this.total.set(res.total);
                        this.loading.set(false);
                    },
                    error: () => {
                        this.items.set([]);
                        this.total.set(0);
                        this.loading.set(false);
                    },
                });
        }, { allowSignalWrites: true });
    }

    public setFilter(value: StatusFilter) {
        if (this.statusFilter() !== value) {
            this.statusFilter.set(value);
            this.page.set(1);
        }
    }

    public setLimit(l: number) {
        if (this.limit() !== l) {
            this.limit.set(l);
            this.page.set(1);
        }
    }

    public nextPage() {
        if (this.page() < this.totalPages()) this.page.update(v => v + 1);
    }
    public prevPage() {
        if (this.page() > 1) this.page.update(v => v - 1);
    }

    public async onStatusAction(v: IVoice, next: VoiceStatus) {
        if (v.status === next) return;
        try {
            this.loading.set(true);
            await this.svc.setVoiceStatus(v.id, next).toPromise();
            const updated = this.items().map(it => (it.id === v.id ? { ...it, status: next } : it));
            this.items.set(updated);
        } finally {
            this.loading.set(false);
        }
    }

    public async onDelete(v: IVoice) {
        if (!confirm(`Delete submission #${v.id}?`)) return;
        try {
            this.loading.set(true);
            const res = await this.svc.deleteVoiceById(v.id).toPromise();
            if (res?.affected) {
                this.items.set(this.items().filter(it => it.id !== v.id));
                this.total.update(t => Math.max(0, t - 1));
            }
        } finally {
            this.loading.set(false);
        }
    }

    public trackById = (_: number, it: IVoice) => it.id;

    public copyImg(url: string) {
        navigator.clipboard?.writeText(url);
    }
}
