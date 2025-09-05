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
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ChipInputComponent } from "src/app/shared/components/chip-input/chip-input.component";
import { CloudinaryService } from "src/app/shared/services/cloudinary.service";
import { UserService } from "src/app/shared/services/user.service";
import { IVoice, VoiceStatus, VoicesListResponse } from '../../../shared/interfaces/voices';
import { VoicesService } from '../../services/voices.service';

type StatusFilter = 'all' | VoiceStatus;

@Component({
    selector: 'admin-voices-table',
    standalone: true,
    imports: [CommonModule, A11yModule, ChipInputComponent, ReactiveFormsModule, MatProgressSpinner],
    templateUrl: './voices.component.html',
    styleUrl: './voices.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoicesComponent {
    private readonly svc = inject(VoicesService);
    private readonly destroyRef = inject(DestroyRef);

    private snackBar: MatSnackBar = inject(MatSnackBar);

    public userService = inject(UserService);

    public VoiceStatus: typeof VoiceStatus = VoiceStatus;
    // --- UI state
    public statusFilter = signal<StatusFilter>(VoiceStatus.Pending); // стартуем с "pending"
    public page = signal(1);
    public limit = signal(20);
    public search = signal('');

    // --- data
    public loading = signal(false);
    public items = signal<IVoice[]>([]);
    public total = signal(0);

    private lastFocusedEl: HTMLElement | null = null;
    public previewIndex = signal<number | null>(null);

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

    public previewOpen = computed(() => this.previewIndex() !== null);
    public currentPreview = computed(() => {
        const idx = this.previewIndex();
        const list = this.filtered();
        if (idx === null || idx < 0 || idx >= list.length) return null;
        return list[idx];
    });

    public currentPreviewImg = () => this.currentPreview()?.img ?? '';
    public currentPreviewAlt = () => `image #${this.currentPreview()?.id ?? ''}`;

    // public openPreview(index: number) {
    //     this.lastFocusedEl = document.activeElement as HTMLElement;
    //     this.previewIndex.set(index);
    //     document.body.style.overflow = 'hidden';

    //     queueMicrotask(() => {
    //         const overlay = document.querySelector('.preview-overlay') as HTMLElement | null;
    //         overlay?.focus();
    //     });

    //     this.preloadAround(index);
    // }

    public closePreview() {
        this.previewIndex.set(null);
        document.body.style.overflow = '';
        this.lastFocusedEl?.focus?.();
    }

    public nextPreview() {
        const list = this.filtered();
        if (!list.length) return;
        const idx = (this.previewIndex() ?? 0) + 1;
        this.previewIndex.set(idx >= list.length ? 0 : idx);
        this.preloadAround(this.previewIndex()!);
    }

    public prevPreview() {
        const list = this.filtered();
        if (!list.length) return;
        const idx = (this.previewIndex() ?? 0) - 1;
        this.previewIndex.set(idx < 0 ? list.length - 1 : idx);
        this.preloadAround(this.previewIndex()!);
    }

    public onOverlayBackdrop(ev: MouseEvent) {
        this.closePreview();
    }

    public onOverlayKeydown(ev: KeyboardEvent) {
        if (ev.key === 'Escape') {
            ev.preventDefault();
            this.closePreview();
        } else if (ev.key === 'ArrowRight') {
            ev.preventDefault();
            this.nextPreview();
        } else if (ev.key === 'ArrowLeft') {
            ev.preventDefault();
            this.prevPreview();
        }
    }

    private preloadAround(index: number) {
        const list = this.filtered();
        const neighbors = [index - 1, index + 1]
            .map(i => (i < 0 ? list.length - 1 : i >= list.length ? 0 : i));
        for (const i of neighbors) {
            const url = list[i]?.img;
            if (!url) continue;
            const img = new Image();
            img.src = url;
        }
    }

    private readonly cloud = inject(CloudinaryService);

    public rot = signal<0 | 90 | 180 | 270>(0);
    public flipH = signal(false);
    public flipV = signal(false);

    public previewTransform = computed(() => {
        const r = this.rot();
        const sx = this.flipH() ? -1 : 1;
        const sy = this.flipV() ? -1 : 1;
        return `scale(${sx}, ${sy}) rotate(${r}deg)`;
    });

    public rotateLeft() { this.rot.set(this.nextAngle(this.rot(), -90)); }
    public rotateRight() { this.rot.set(this.nextAngle(this.rot(), 90)); }
    public toggleFlipH() { this.flipH.update(v => !v); }
    public toggleFlipV() { this.flipV.update(v => !v); }
    public resetTransform() { this.rot.set(0); this.flipH.set(false); this.flipV.set(false); }

    private nextAngle(a: 0 | 90 | 180 | 270, delta: -90 | 90): 0 | 90 | 180 | 270 {
        const vals: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
        const idx = vals.indexOf(a);
        const next = (idx + (delta === 90 ? 1 : -1) + vals.length) % vals.length;
        return vals[next];
    }

    private async transformViaCanvas(
        srcUrl: string, angle: 0 | 90 | 180 | 270, flipH: boolean, flipV: boolean
    ): Promise<Blob> {
        const img = await new Promise<HTMLImageElement>((res, rej) => {
            const i = new Image();
            i.crossOrigin = 'anonymous';
            i.onload = () => res(i);
            i.onerror = rej;
            i.src = srcUrl;
        });

        const radians = (angle * Math.PI) / 180;
        const swapWH = angle === 90 || angle === 270;
        const w = img.width;
        const h = img.height;
        const cw = swapWH ? h : w;
        const ch = swapWH ? w : h;

        const canvas = document.createElement('canvas');
        canvas.width = cw; canvas.height = ch;
        const ctx = canvas.getContext('2d')!;
        ctx.save();

        ctx.translate(cw / 2, ch / 2);
        ctx.rotate(radians);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        const dx = -(w / 2);
        const dy = -(h / 2);
        ctx.drawImage(img, dx, dy, w, h);
        ctx.restore();

        return await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), 'image/jpeg', 0.92));
    }

    public async savePreviewTransform() {
        const cur = this.currentPreview();
        if (!cur) return;
        const { id, img } = cur;
        const angle = this.rot();
        const flH = this.flipH(); const flV = this.flipV();
        if (!angle && !flH && !flV) return;

        try {
            this.loading.set(true);

            let finalUrl = img;

            // if (this.isCloudinaryUrl(img)) {
            //     finalUrl = this.buildCloudinaryUrl(img, angle, flH, flV);
            // } else {
            const blob = await this.transformViaCanvas(img, angle, flH, flV);
            const file = new File([blob], `voice-${id}.jpg`, { type: 'image/jpeg' });
            const uploaded = await this.cloud.uploadImageAndGetUrl(file).toPromise();

            finalUrl = uploaded?.imageUrl.url ?? img;
            // }
            await this.svc.updateVoiceImage(id, finalUrl).toPromise();
            const updated = this.items().map(it => it.id === id ? { ...it, img: finalUrl } : it);
            this.items.set(updated);
        } finally {
            this.loading.set(false);
        }
    }

    loadEnd() {
        this.resetTransform();
    }

    public openPreview(index: number) {
        this.resetTransform();
        this.lastFocusedEl = document.activeElement as HTMLElement;
        this.previewIndex.set(index);
        document.body.style.overflow = 'hidden';
        queueMicrotask(() => {
            const overlay = document.querySelector('.preview-overlay') as HTMLElement | null;
            overlay?.focus();
        });
        this.preloadAround(index);
    }

    public editing = signal<IVoice | null>(null);
    public editorOpen = computed(() => !!this.editing());

    public openEditor(v: IVoice) {
        const fresh = this.items().find(x => x.id === v.id) ?? v;
        this.editing.set({ ...fresh });
        document.body.style.overflow = 'hidden';
    }
    public closeEditor() {
        this.editing.set(null);
        document.body.style.overflow = '';
    }

    public saving = signal(false);
    public saved = signal(false);

    private fb = inject(FormBuilder);
    public form = this.fb.group({
        firstName: [''],
        email: ['', []], // при желании Validators.email
        location: [''],
        creditTo: [''],
        note: [''],
        what: this.fb.control<string[]>([]),
        express: this.fb.control<string[]>([]),
        img: [''],
    });

    private formSub = effect(() => {
        const v = this.editing();
        if (!v) return;

        this.form.reset({
            firstName: v.firstName ?? '',
            email: v.email ?? '',
            location: v.location ?? '',
            creditTo: v.creditTo ?? '',
            note: v.note ?? '',
            what: v.what ?? [],
            express: v.express ?? [],
            img: v.img ?? '',
        }, { emitEvent: false });

        // const sub = this.form.valueChanges
        //     .pipe(debounceTime(600), distinctUntilChanged())
        //     .subscribe(() => this.autoSave());
        // this.destroyRef.onDestroy(() => sub.unsubscribe());
    });

    private lastPatch: any = null;

    private async autoSave() {
        if (!this.editing() || !this.form.dirty) return;
        // await this.savePatch();
    }

    public async forceSave() {
        await this.savePatch(true);
    }

    private async savePatch(force = false) {
        const e = this.editing(); if (!e) return;
        // const patch = this.diffPatch(e, this.form.getRawValue());
        // if (!force && (!patch || Object.keys(patch).length === 0)) return;
        this.saving.set(true); this.saved.set(false);
        try {
            await this.svc.updateVoiceById(e.id, this.form.value).toPromise();
            const updatedVoice = this.form.value as IVoice;
            const updated = this.items().map(it => it.id === e.id ? { ...it, ...updatedVoice } : it);

            this.items.set(updated);

            this.editing.set(updated.find(x => x.id === e.id)!);
            this.form.markAsPristine();
            this.saved.set(true);
            setTimeout(() => this.saved.set(false), 1200);
        } catch (e) {
            this.snackBar.open(JSON.stringify(e), 'Close', {
                duration: 7000,
                verticalPosition: 'top',
            });
            console.error(e);
        } finally {
            this.saving.set(false);
        }
    }

    private diffPatch(orig: IVoice, now: any) {
        const out: Record<string, any> = {};
        (['firstName', 'email', 'location', 'creditTo', 'note', 'img'] as const).forEach(k => {
            if ((orig as any)[k] ?? '' !== (now as any)[k] ?? '') out[k] = now[k];
        });
        (['what', 'express'] as const).forEach(k => {
            const a = JSON.stringify((orig as any)[k] ?? []);
            const b = JSON.stringify((now as any)[k] ?? []);
            if (a !== b) out[k] = now[k];
        });
        return out;
    }

    public async quickStatus(status: VoiceStatus) {
        const e = this.editing(); if (!e || e.status === status) return;
        this.saving.set(true); this.saved.set(false);
        try {
            await this.svc.setVoiceStatus(e.id, status).toPromise();
            const updated = this.items().map(it => it.id === e.id ? { ...it, status } : it);
            this.items.set(updated);
            this.editing.set({ ...e, status });
            this.saved.set(true);
            setTimeout(() => this.saved.set(false), 1000);
        } finally {
            this.saving.set(false);
        }
    }

    public nextFromFiltered() {
        const list = this.filtered(); if (!list.length || !this.editing()) return;
        const idx = list.findIndex(x => x.id === this.editing()!.id);
        const next = list[(idx + 1) % list.length];
        this.openEditor(next);
    }
    public prevFromFiltered() {
        const list = this.filtered(); if (!list.length || !this.editing()) return;
        const idx = list.findIndex(x => x.id === this.editing()!.id);
        const prev = list[(idx - 1 + list.length) % list.length];
        this.openEditor(prev);
    }
    public onSheetKey(ev: KeyboardEvent) {
        if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 's') {
            ev.preventDefault(); this.forceSave();
        } else if (ev.key === 'Escape') {
            ev.preventDefault(); this.closeEditor();
        } else if (ev.key === 'ArrowRight') {
            ev.preventDefault(); this.nextFromFiltered();
        } else if (ev.key === 'ArrowLeft') {
            ev.preventDefault(); this.prevFromFiltered();
        }
    }

    public visibleActions(v: IVoice) {
        return this.statusActions.filter(a => a.value !== v.status);
    }

    public async onPickImg(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
        const uploaded = await this.cloud.uploadImageAndGetUrl(file).toPromise();
        const url = uploaded?.imageUrl.url;
        if (url) this.form.patchValue({ img: url });
    }

    public async applyImgTransform() {
        const e = this.editing(); if (!e) return;
        const { id, img } = e;
        const angle = this.rot();
        const flH = this.flipH(); const flV = this.flipV();
        if (!angle && !flH && !flV) return;

        this.saving.set(true); 
        this.saved.set(false);

        try {
            this.loading.set(true);

            let finalUrl = img;

            const blob = await this.transformViaCanvas(img, angle, flH, flV);
            const file = new File([blob], `voice-${id}.jpg`, { type: 'image/jpeg' });
            const uploaded = await this.cloud.uploadImageAndGetUrl(file).toPromise();

            finalUrl = uploaded?.imageUrl.url ?? img;

            await this.svc.updateVoiceImage(id, finalUrl).toPromise();
            const updated = this.items().map(it => it.id === id ? { ...it, img: finalUrl } : it);
            this.items.set(updated);

        } finally {
            this.loading.set(false);
            this.saving.set(false); 
            this.saved.set(true);
            setTimeout(() => this.saved.set(false), 1200);
        }
    }
}
