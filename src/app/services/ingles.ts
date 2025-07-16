// src/app/pages/listening/listening.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-listening',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold">Listening</h1>
      <p class="mt-2">Aquí irán las prácticas de comprensión auditiva.</p>
    </div>
  `
})
export class Listening {}
