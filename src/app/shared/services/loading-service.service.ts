import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {

    private loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    public loading$: Observable<boolean> = this.loadingSubject.asObservable();

    public start(): void {
        this.loadingSubject.next(true);
    }

    public async end(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 600));
        this.loadingSubject.next(false);
    }
}
