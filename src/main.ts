import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app/app.routes';
  providers: [
    provideRouter(
      routes,
      withRouterConfig({ onSameUrlNavigation: 'reload' }) // 👈 important
    )
  ]
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
