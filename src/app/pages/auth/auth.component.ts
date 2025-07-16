import { Component, NgZone } from '@angular/core'; // 1. Importa NgZone
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  isLoginMode = true;
  email = 'user@example.com';
  password = 'password123';
  errorMessage = '';

  constructor(
   private authService: AuthService,
    private router: Router,
    private zone: NgZone
  ) {}

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  // 3. Nuevo método que será llamado por el botón
  handleAuth() {
    this.zone.run(() => {
      if (!this.email || !this.password) {
        this.errorMessage = 'Email y contraseña son requeridos.';
        return;
      }

      const action = this.isLoginMode
        ? this.authService.login(this.email, this.password)
        : this.authService.register(this.email, this.password);

      action.subscribe({
        next: () => {
          // ... (lógica de éxito)
        },
        error: (err) => {
          // 👇 === ESTA ES LA LÍNEA MÁS IMPORTANTE === 👇
          // Convertimos el objeto de error completo a texto para poder verlo.
          this.errorMessage = `Error Detallado: ${JSON.stringify(err)}`;
        },
      });
    });
  }
}