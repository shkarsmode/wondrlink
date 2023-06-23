import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ImageProloaderService {

    private readonly path: string = 'assets/img/';
    private readonly images: string[] = [
        'bg.png', 
        'blog-banner.png', 
        'Industry.png', 
        'Patients.png',
        'Physicians.png',
        'providers.png',
        'Vector.png',
        'about-us.png',
        'care.png',
        'commitment.png',
        
    ];
    private loadedLenght: number = 0;

    constructor() { }

    public isloadedAll(): boolean {
        this.loadedLenght++;
        if (this.images.length === this.loadedLenght){
            return true;
        }

        return false;
    }

    public getAllBGImagesPath(): string[] {
        return this.images.map(image => this.path + image);
    }

}
