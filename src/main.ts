import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import 'hammerjs'; // for gallery thumb and mouse swipe to work

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
