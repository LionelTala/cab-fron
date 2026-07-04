import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        (req, next) => {
          let secureReq = req.clone({ withCredentials: true });

          const token = getCookie('XSRF-TOKEN');
          if (token) {
            secureReq = secureReq.clone({
              setHeaders: { 'X-XSRF-TOKEN': token }
            });
          }

          return next(secureReq);
        }
      ])
    ), provideClientHydration(withEventReplay())
  ]
};
