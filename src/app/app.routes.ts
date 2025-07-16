import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { Listening } from './pages/listening/listening';
import { Relax } from './pages/relax/relax';
import { AudioUploaderComponent } from './pages/audio-uploader/audio-uploader.component';
import { SelfEvaluationComponent } from './pages/self-evaluation/self-evaluation.component';
import { AuthComponent } from './pages/auth/auth.component';
import { AuthGuard } from './guards/auth.guard';
import { AudioManagerComponent } from './pages/audio-manager/audio-manager';
import { SelfAssessmentComponent } from './pages/self-assessment/self-assessment';
import { AssessmentSetupComponent } from './pages/assessment-setup/assessment-setup';

@Component({
  standalone: true,
  template: `<h1 class="p-4 text-2xl">Página de Inicio</h1>`,
})
export class HomeComponent {}

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'ingles/listening', component: Listening, canActivate: [AuthGuard] },
  { path: 'ingles/relax', component: Relax, canActivate: [AuthGuard] },
  { path: 'audio-uploader', component: AudioUploaderComponent, canActivate: [AuthGuard] },
  { path: 'autoevaluacion', component: SelfEvaluationComponent, canActivate: [AuthGuard] },
  { path: 'audio-manager', component: AudioManagerComponent, canActivate: [AuthGuard] },
   { path: 'self-assessment', component: SelfAssessmentComponent, canActivate: [AuthGuard] }, // <-- AÑADE ESTA LÍNEA
     { path: 'assessment-setup', component: AssessmentSetupComponent, canActivate: [AuthGuard] },


];