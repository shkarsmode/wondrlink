import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ImageUrlResponseDto } from 'src/app/shared/interfaces/imageUrlResponse.dto';
import { BASE_PATH_API } from './variables';

@Injectable({
    providedIn: 'root'
})
export class CloudinaryService {

    private readonly imgPath: string = 'images';

    constructor(
        private http: HttpClient,
        @Inject(BASE_PATH_API) private basePathApi: string
    ) { }

    public uplodaImageAndGetUrl(image: any): Observable<ImageUrlResponseDto> {
        const formData = new FormData();
        formData.append('image', image);

        return this.http.post<ImageUrlResponseDto>(
            `${this.basePathApi}/${this.imgPath}/upload`, 
            formData
        );
    } 
}
