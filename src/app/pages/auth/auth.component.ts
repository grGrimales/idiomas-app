import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  // providers: [AuthService] <-- ELIMINA ESTA LÍNEA
})
export class AuthComponent {
  isLoginMode = true;
  email = 'user@example.com';
  password = 'password123';
  errorMessage = '';

  // Tu constructor y el resto del código están correctos.
  constructor(private authService: AuthService, private router: Router) {}

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit() {
    if (this.isLoginMode) {
      console.log(this.email, this.password);
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          console.log('Login successful');
          this.router.navigate(['/']); // Ahora esto funcionará
        },
        error: (err) => (this.errorMessage = err.error.message),
      });
    } else {
      this.authService.register(this.email, this.password).subscribe({
        next: () => this.onSwitchMode(),
        error: (err) => (this.errorMessage = err.error.message),
      });
    }
  }
}