import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    CreateVoiceRequest,
    IVoice,
    UpdateVoiceRequest,
    VoicesListResponse,
    VoiceStatus
} from 'src/app/shared/interfaces/voices';
import { BASE_PATH_API } from 'src/app/shared/services/variables';

@Injectable({
    providedIn: 'root'
})
export class VoicesService {

    private readonly path = 'voices';

    constructor(
        private http: HttpClient,
        @Inject(BASE_PATH_API) private basePathApi: string
    ) { }

    public getVoices(
        limit: number,
        page: number,
        status?: VoiceStatus
    ): Observable<VoicesListResponse> {
        let params = new HttpParams()
            .set('limit', String(limit))
            .set('page', String(page));

        if (status) params = params.set('status', status);

        return this.http.get<VoicesListResponse>(
            `${this.basePathApi}/${this.path}`,
            { params }
        );
    }

    public getApprovedVoices(limit: number, page: number): Observable<VoicesListResponse> {
        return this.getVoices(limit, page, VoiceStatus.Approved);
    }

    public getVoiceById(id: number): Observable<IVoice> {
        return this.http.get<IVoice>(
            `${this.basePathApi}/${this.path}/${id}`
        );
    }

    public createVoice(payload: CreateVoiceRequest): Observable<IVoice> {
        return this.http.post<IVoice>(
            `${this.basePathApi}/${this.path}`,
            payload
        );
    }

    public updateVoiceById(id: number, payload: UpdateVoiceRequest): Observable<{ affected: number }> {
        return this.http.patch<{ affected: number }>(
            `${this.basePathApi}/${this.path}/${id}`,
            payload
        );
    }

    public setVoiceStatus(
        id: number,
        status: VoiceStatus
    ): Observable<{ affected: number; id: number; status: VoiceStatus }> {
        return this.http.patch<{ affected: number; id: number; status: VoiceStatus }>(
            `${this.basePathApi}/${this.path}/${id}/status`,
            { status }
        );
    }

    public deleteVoiceById(id: number): Observable<{ affected: number }> {
        return this.http.delete<{ affected: number }>(
            `${this.basePathApi}/${this.path}/${id}`
        );
    }
}
