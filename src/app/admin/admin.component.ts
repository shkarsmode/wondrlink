import { Component } from '@angular/core';
import { AuthService } from 'src/services/auth.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {

    constructor(public authService: AuthService) {}
}
