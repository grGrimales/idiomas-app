import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes';
//import 'zone.js'; // 👈 obligatorio para Angular
import { appConfig } from './app/app.config';


bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));


