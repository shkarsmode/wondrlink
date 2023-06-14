import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';

import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorInterceptor } from 'src/app/shared/helpers/error.interceptor';
import { JwtInterceptor } from 'src/app/shared/helpers/jwt.interceptor';
import { AUTH_PATH_API, BASE_PATH_API } from 'src/app/shared/services/variables';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CheckEmailComponent } from './shared/dialogs/check-email/check-email.component';
import { MaterialModule } from './shared/materials/material.module';



@NgModule({
    declarations: [
        AppComponent,
        CheckEmailComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MaterialModule
    ],
    providers: [
        JwtHelperService,
        HttpClient,
        {
			provide: HTTP_INTERCEPTORS,
			useClass: ErrorInterceptor,
			multi: true,
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: JwtInterceptor,
			multi: true,
		},
		{ provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        { provide: AUTH_PATH_API, useValue: environment.authPathApi },
        { provide: BASE_PATH_API, useValue: environment.basePathApi },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
