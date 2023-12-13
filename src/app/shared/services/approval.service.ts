import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {
  private approveSubject = new BehaviorSubject<boolean>(false);
  approved$ = this.approveSubject.asObservable();

   constructor() { }

  public accessApprovedDialog(isAccess: boolean) {
    this.approveSubject.next(isAccess)
  }

}
