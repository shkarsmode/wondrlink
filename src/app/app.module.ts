import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';

import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ErrorInterceptor } from 'src/helpers/error.interceptor';
import { JwtInterceptor } from 'src/helpers/jwt.interceptor';
import { AUTH_PATH_API } from 'src/services/variables';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';



@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule
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
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
