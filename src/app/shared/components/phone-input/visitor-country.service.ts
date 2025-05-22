import { inject, Injectable } from '@angular/core';
import { StorageService } from '../../services/storage-service.service';

@Injectable({
  providedIn: 'root',
})
export class VisitorCountryService {
  constructor() {
    this.clearVisitorCountry();
  }

  private storageService: StorageService = inject(StorageService);

  clearVisitorCountry() {
    this.storageService.remove('visitorCountry');
  }
}
