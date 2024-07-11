import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';

import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ErrorInterceptor } from 'src/app/shared/helpers/error.interceptor';
import { JwtInterceptor } from 'src/app/shared/helpers/jwt.interceptor';
import { AUTH_PATH_API, BASE_PATH_API, GEO_API_KEY, GEO_PATH_API } from 'src/app/shared/services/variables';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CheckEmailComponent } from './shared/dialogs/check-email/check-email.component';
import { SignUpComponent } from './shared/dialogs/sign-up/sign-up.component';
import { ThankYouComponent } from './shared/dialogs/thank-you/thank-you.component';
import { MaterialModule } from './shared/materials/material.module';



@NgModule({
    declarations: [
        AppComponent,
        CheckEmailComponent,
        SignUpComponent,
        ThankYouComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MaterialModule,
        FormsModule,
        AngularSvgIconModule.forRoot(),
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
        { provide: GEO_API_KEY, useValue: environment.geoApiKey },
        { provide: GEO_PATH_API, useValue: environment.geoPathAPI },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
