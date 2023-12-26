import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionSelectionChange } from '@angular/material/core';
import { Subject, ThrottleConfig, asyncScheduler, takeUntil, tap, throttleTime } from 'rxjs';
import { IGeoLocation } from 'src/app/shared/interfaces/geo/geo-location.interface';
import { AutocompleteService } from 'src/app/shared/services/autocomplete.service';
import { AutocompleteHighlightPipe } from '../../pipes/autocomplete-highlight.pipe';

@Component({
    selector: 'app-input-location-autocomplete',
    templateUrl: './input-location-autocomplete.component.html',
    styleUrls: ['./input-location-autocomplete.component.scss'],
    standalone: true,
    imports: [CommonModule, MatAutocompleteModule, AutocompleteHighlightPipe],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputLocationAutocompleteComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputLocationAutocompleteComponent
    implements ControlValueAccessor, OnDestroy
{
    public value: string = '';
    public autocompleteLocations: IGeoLocation[] = [];

    private _destroy$: Subject<void> = new Subject<void>();
    private _autocompleteInputChanged$: Subject<Event> = new Subject<Event>();
    private _throttleConfig: ThrottleConfig = {
        leading: false,
        trailing: true,
    };

    constructor(
        private readonly _cdr: ChangeDetectorRef,
        private readonly _autocompleteService: AutocompleteService
    ) {}

    public onChangeLocation(event: Event): void {
        if (this._autocompleteInputChanged$.observers.length === 0) {
            this._autocompleteInputChanged$
                .pipe(
                    throttleTime(500, asyncScheduler, this._throttleConfig),
                    takeUntil(this._destroy$)
                )
                .subscribe(() => this._getAutocompleteLocation(event));
        }

        this._autocompleteInputChanged$.next(event);
    }

    private _getAutocompleteLocation(event: Event): void {
        const text = (event.target as HTMLInputElement).value;

        if (text.length < 3) {
            this.autocompleteLocations = [];
            return;
        }

        this._autocompleteService
            .getLocationAutocomplete(text)
            .pipe(
                tap(console.log), 
                takeUntil(this._destroy$)
            )
            .subscribe((locations) => {
                this.autocompleteLocations = locations;
                this._cdr.markForCheck();
            });
    }

    public registerOnChange = (fn: any) => (this._onChange = fn);
    public registerOnTouched = (fn: any) => (this._onTouched = fn);
    public writeValue = (value: any) => this.value = value ?? this.value;

    public onSelectChange(
        optionChangeEvent: MatOptionSelectionChange<IGeoLocation>
    ): void {
        const { city, country } = optionChangeEvent.source.value;
        this.value = `${city}, ${country}`; ;
        this._onChange(this.value);
        this._onTouched();
    }

    private _onChange: any = () => {};
    private _onTouched: any = () => {};

    public ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
