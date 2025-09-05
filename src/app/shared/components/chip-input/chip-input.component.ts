import { CommonModule } from '@angular/common';
import {
  Component, ElementRef, EventEmitter, forwardRef, HostBinding, Input, Output,
  QueryList,
  ViewChild, ViewChildren
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

type Variant = 'blue' | 'green' | 'gray';

@Component({
  selector: 'app-chip-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="chip-input" (click)="onHostClick($event)">
  <label *ngIf="label" class="label">{{ label }}</label>

  <div class="box" [class.disabled]="disabled">
    <!-- chips -->
    <button
      #chipBtn
      class="chip"
      [ngClass]="variant"
      *ngFor="let t of value; let i = index"
      type="button"
      (keydown)="onKeydownChip($event,i)"
      (click)="focusChip(i)">
      <span class="txt">{{ t }}</span>
      <span class="x" (click)="removeAt(i)" aria-label="Remove">×</span>
    </button>

    <!-- input -->
    <input
      #inputEl
      [disabled]="disabled"
      [placeholder]="value.length ? '' : placeholder"
      [value]="buf"
      (input)="onInput($event)"
      (keydown)="onKeydownInput($event)"
      (focus)="onFocus()"
      (blur)="onBlur()"
      type="text" />
    <span #sizer class="sizer" aria-hidden="true"></span>
  </div>

  <!-- suggestions -->
  <div class="suggest" *ngIf="openSuggest">
    <button
      *ngFor="let opt of filteredOptions; let i = index"
      type="button"
      class="sug"
      [class.active]="i===hoveredSuggest"
      (mouseenter)="hoveredSuggest=i"
      (click)="pickOption(opt)">
      {{ opt }}
    </button>
  </div>
</div>`,
  styles: `
    :host { display:block; }

.label {
  display:block; margin-bottom:6px; font-size:12px; color: var(--muted);
}

.chip-input.shake .box { animation: shake .18s ease-in-out; }
@keyframes shake { 0% { transform: translateX(0) } 25% { transform: translateX(-2px) }
  50% { transform: translateX(2px) } 100% { transform: translateX(0) } }

.box {
  min-height: 40px;
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
  padding: 6px; border-radius: 10px;
  background: var(--card); border: 1px solid var(--line);
  cursor:text;
  &.disabled { opacity:.6; cursor: default; }
}

input {
  min-width: 80px; width: 120px; max-width: 240px;
  border: none; outline: none; background: transparent; color: #333;
  padding: 6px 8px; font: inherit;
}
.sizer { position: absolute; visibility: hidden; white-space: pre; padding: 0 8px; }

.chip {
  display:inline-flex; align-items:center; gap:6px; border-radius: 999px;
  padding: 4px 8px; border: 1px solid var(--line); background: #fff; color:#333;
  cursor: pointer; user-select: none;
  &.blue  { background: rgba(90,169,255,.12);  border-color: rgba(90,169,255,.3);  color: #337ab7; }
  &.green { background: rgba(73,214,159,.12);  border-color: rgba(73,214,159,.3);  color: #00a76f; }
  &.gray  { background: #fff; }
  &:focus-visible { outline: 2px solid #337ab7; outline-offset: 2px; }
  .x { font-weight:700; line-height:1; cursor:pointer; }
}

.suggest {
  margin-top:6px; background: var(--bg); border:1px solid var(--line);
  border-radius: 10px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.12);
}
.sug {
  display:block; width:100%; text-align:left; padding:8px 10px; cursor:pointer;
  background: #fff; border: none; border-bottom: 1px solid var(--line);
  &:last-child { border-bottom: 0; }
  &.active, &:hover { background: var(--card); }
}
  `,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ChipInputComponent),
    multi: true
  }]
})
export class ChipInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '+ add';
  @Input() options: string[] = [];                // подсказки (необязательно)
  @Input() delimiters: string[] = [',', ';', '\n', '\r'];
  @Input() allowDuplicates = false;
  @Input() caseSensitive = false;
  @Input() maxTagLength = 50;
  @Input() allowedPattern: RegExp | null = null;  // например: /^[a-z0-9\- ]+$/i
  @Input() variant: Variant = 'gray';

  @Output() valueChange = new EventEmitter<string[]>(); // на случай, если хочешь слушать

  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;
  @ViewChild('sizer') sizer!: ElementRef<HTMLSpanElement>;
  @ViewChildren('chipBtn') chipBtns!: QueryList<ElementRef<HTMLButtonElement>>;

  @HostBinding('attr.data-variant') get dataVariant() { return this.variant; }

  value: string[] = [];
  buf = '';
  focusedChip = -1;           // индекс фокус-чипа, -1 — фокус в инпуте
  disabled = false;

  // подсказки
  openSuggest = false;
  hoveredSuggest = -1;

  // CVA
  private onChange: (v: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: string[] | null): void {
    this.value = Array.isArray(v) ? [...v] : [];
    this.emit();
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  // --- helpers
  private norm(s: string) { return this.caseSensitive ? s : s.toLowerCase(); }
  private tokenize(raw: string): string[] {
    const rx = new RegExp(`[${this.delimiters.map(d => d.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('')}]`, 'g');
    return raw.split(rx).map(s => s.trim()).filter(Boolean);
  }
  private canAdd(tag: string): string | null {
    if (!tag) return 'empty';
    if (this.allowedPattern && !this.allowedPattern.test(tag)) return 'pattern';
    if (tag.length > this.maxTagLength) return 'length';
    if (!this.allowDuplicates && this.value.map(v => this.norm(v)).includes(this.norm(tag))) return 'duplicate';
    return null;
  }
  private emit() {
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  // --- actions
  addFromBuffer() {
    const parts = this.tokenize(this.buf);
    if (!parts.length) return;
    let added = false;
    for (const p of parts) {
      const err = this.canAdd(p);
      if (!err) {
        this.value.push(p);
        added = true;
      } else {
        this.shake(); // визуальный хинт
      }
    }
    if (added) this.emit();
    this.buf = '';
    this.resizeInput();
  }

  add(tag: string) {
    tag = tag.trim();
    const err = this.canAdd(tag);
    if (err) { this.shake(); return; }
    this.value.push(tag);
    this.emit();
    this.buf = '';
    this.resizeInput();
    this.focusInput();
  }

  removeAt(i: number) {
    if (i < 0 || i >= this.value.length) return;
    this.value.splice(i, 1);
    this.emit();
    // фокус смещаем адекватно
    setTimeout(() => {
      if (this.value.length === 0) { this.focusInput(); return; }
      const next = Math.min(i, this.value.length - 1);
      this.focusChip(next);
    });
  }

  // --- focus management
  focusInput() { this.focusedChip = -1; this.inputEl?.nativeElement.focus(); }
  focusChip(i: number) {
    this.focusedChip = i;
    this.chipBtns.get(i)?.nativeElement.focus();
  }

  // --- keyboard
  onKeydownInput(ev: KeyboardEvent) {
    if (this.disabled) return;

    const key = ev.key;
    const shouldAdd = key === 'Enter' || key === 'Tab' || this.delimiters.includes(key);
    if (shouldAdd) {
      ev.preventDefault();
      if (this.buf.trim()) this.addFromBuffer();
      return;
    }
    if (key === 'Backspace' && !this.buf) {
      ev.preventDefault();
      this.removeAt(this.value.length - 1);
      return;
    }
    if (key === 'ArrowLeft' && !this.buf && this.value.length) {
      ev.preventDefault();
      this.focusChip(this.value.length - 1);
      return;
    }
    // подсказки
    if (this.openSuggest && ['ArrowDown','ArrowUp','Enter','Escape'].includes(key)) {
      ev.preventDefault();
      if (key === 'ArrowDown') this.hoveredSuggest = Math.min(this.hoveredSuggest + 1, this.filteredOptions.length - 1);
      if (key === 'ArrowUp') this.hoveredSuggest = Math.max(this.hoveredSuggest - 1, 0);
      if (key === 'Enter' && this.filteredOptions[this.hoveredSuggest]) this.add(this.filteredOptions[this.hoveredSuggest]);
      if (key === 'Escape') this.openSuggest = false;
    }
  }

  onKeydownChip(ev: KeyboardEvent, i: number) {
    if (this.disabled) return;
    if (ev.key === 'Backspace' || ev.key === 'Delete') { ev.preventDefault(); this.removeAt(i); return; }
    if (ev.key === 'ArrowLeft') { ev.preventDefault(); this.focusChip(Math.max(0, i - 1)); return; }
    if (ev.key === 'ArrowRight') { ev.preventDefault(); (i + 1 < this.value.length) ? this.focusChip(i + 1) : this.focusInput(); return; }
  }

  // --- input / paste / suggest
  onInput(e: Event) {
    this.buf = (e.target as HTMLInputElement).value;
    // если ввели разделитель — сразу токенизируем
    if (this.delimiters.some(d => this.buf.includes(d))) this.addFromBuffer();
    this.resizeInput();
    this.openSuggest = !!this.buf && this.filteredOptions.length > 0;
    this.hoveredSuggest = 0;
  }
  onBlur() { this.onTouched(); this.openSuggest = false; }
  onFocus() { if (this.buf) this.openSuggest = this.filteredOptions.length > 0; }

  onPaste(e: ClipboardEvent) {
    const text = e.clipboardData?.getData('text');
    if (!text) return;
    e.preventDefault();
    this.buf += text;
    this.addFromBuffer();
  }

  get filteredOptions(): string[] {
    if (!this.options?.length || !this.buf) return [];
    const needle = this.norm(this.buf.trim());
    const existing = new Set(this.value.map(v => this.norm(v)));
    return this.options
      .filter(o => this.norm(o).includes(needle) && !existing.has(this.norm(o)))
      .slice(0, 8);
  }

  pickOption(opt: string) { this.add(opt); this.openSuggest = false; }

  // --- visual niceties
  @HostBinding('class.shake') shaking = false;
  private shake() {
    this.shaking = true;
    setTimeout(() => (this.shaking = false), 250);
  }
  resizeInput() {
    // авто-ширина
    if (!this.sizer || !this.inputEl) return;
    this.sizer.nativeElement.textContent = this.buf || this.placeholder || '';
    const w = Math.min(this.sizer.nativeElement.offsetWidth + 18, 240);
    this.inputEl.nativeElement.style.width = w + 'px';
  }

  // click по контейнеру
  onHostClick(e: MouseEvent) {
    if (this.disabled) return;
    const target = e.target as HTMLElement;
    if (target.closest('.chip')) return; // не трогаем клик по чипу
    this.focusInput();
  }
}
