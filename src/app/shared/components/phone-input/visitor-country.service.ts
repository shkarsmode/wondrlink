import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VisitorCountryService {
  constructor() {
    this.clearVisitorCountry();
  }

  clearVisitorCountry() {
    localStorage.removeItem('visitorCountry');
  }
}
