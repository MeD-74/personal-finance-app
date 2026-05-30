import { ApplicationConfig, importProvidersFrom, PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { isPlatformServer } from '@angular/common';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

export class CustomTranslateLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private platformId: object,
  ) {}

  getTranslation(lang: string): Observable<any> {
    if (isPlatformServer(this.platformId)) {
      return of({});
    }

    return this.http.get(`./assets/i18n/${lang}.json`);
  }
}

export function HttpLoaderFactory(http: HttpClient, platformId: object) {
  return new CustomTranslateLoader(http, platformId);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient, PLATFORM_ID],
        },
      }),
    ),
  ],
};
