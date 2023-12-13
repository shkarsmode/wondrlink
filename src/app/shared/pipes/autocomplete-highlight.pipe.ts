import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'autocompleteHighlight',
    standalone: true
})
export class AutocompleteHighlightPipe implements PipeTransform {
    public transform(value: string, searchText: string): string {
        if (!searchText || !value) {
            return value;
        }

        const pattern = new RegExp(searchText, 'gi');
        return value.replace(pattern, (match) => `<strong>${match}</strong>`);
    }
}
