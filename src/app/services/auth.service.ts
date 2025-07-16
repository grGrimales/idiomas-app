import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.backendUrl}/auth`; // Reemplazar con la URL de tu backend
  private token: string | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.token = localStorage.getItem('token');
  }

  register(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { email, password });
  }

  login(email: string, password: string) {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        this.token = response.access_token;
        localStorage.setItem('token', this.token);
      })
    );
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }

  renewToken() {
    return this.http.get<{ access_token: string }>(`${this.apiUrl}/renew-token`).pipe(
      tap(response => {
        this.token = response.access_token;
        localStorage.setItem('token', this.token);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}