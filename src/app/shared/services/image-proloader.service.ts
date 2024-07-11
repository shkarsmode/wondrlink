import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ImageProloaderService {
    private readonly path: string = 'assets/img/';
    private readonly images: string[] = [
        'bg.webp',
        'blog-banner.webp',
        'drug-developers.webp',
        'patients.webp',
        'ecosystem.webp',
        'providers.webp',
        'Vector.webp',
        'about-us.webp',
        'care.webp',
        'commitment.webp',
        'heart.webp',
        'telescope.webp',
        'ecosystem-icon.webp',
        'close.svg',
        'arrowback.svg',
        'dropdown.webp',
        // 'union.webp'
    ];
    private readonly materialSymbols: string[] = [
        'location_city',
        'sync',
        'west',
        'east',
        'file_copy',
        'library_add_check',
        'visibility_off',
        'visibility',
        'keyboard_backspace',
        'close'
    ];
    private loadedLenght: number = 0;

    constructor() {}

    public isloadedAll(): boolean {
        this.loadedLenght++;
        if (this.images.length === this.loadedLenght) {
            return true;
        }

        return false;
    }

    public getAllBGImagesPath(): string[] {
        return this.images.map((image) => this.path + image);
    }

    public getAllMaterialSymbols(): string[] {
        return this.materialSymbols;
    }
}
