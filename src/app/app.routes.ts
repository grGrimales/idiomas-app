import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { Listening } from './app/pages/listening/listening';
import { Relax } from './app/pages/relax/relax';




@Component({
  standalone: true,
  template: `<h1 class="p-4 text-2xl">Página de Inicio</h1>`,
})
export class HomeComponent {}

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'ingles/listening', component: Listening },
  { path: 'ingles/relax', component: Relax }, // 👈 nueva ruta

];
