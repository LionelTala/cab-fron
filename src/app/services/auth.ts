import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { env } from '../../env/env';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${env.apiUrl}`;

  // Variable d'état interne
  private authenticated = false;

  constructor(private http: HttpClient) {
    // Persistance après F5 : on se base sur la présence du token, pas d'un simple flag
    this.authenticated = !!localStorage.getItem('auth_token');
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response?.token) {
          localStorage.setItem('auth_token', response.token);
          this.authenticated = true;
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('auth_token');
        this.authenticated = false;
      })
    );
  }

  // La méthode appelée par notre Guard
  isLoggedIn(): boolean {
    return this.authenticated;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
