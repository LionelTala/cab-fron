import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { switchMap } from 'rxjs';
import { env } from '../../env/env';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${env.apiUrl}`;
  private sanctumUrl = `${env.sanctumUrl}`;

  // Variable d'état interne
  private authenticated = false;

  constructor(private http: HttpClient) {
    // Petit hack au démarrage : si tu veux persister l'état après un F5 temporairement
    this.authenticated = localStorage.getItem('is_logged') === 'true';
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.get(`${this.sanctumUrl}/csrf-cookie`).pipe(
      switchMap(() => this.http.post(`${this.apiUrl}/login`, credentials)),
      tap(() => {
        this.authenticated = true;
        localStorage.setItem('is_logged', 'true'); // On garde une trace locale
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.authenticated = false;
        localStorage.removeItem('is_logged');
      })
    );
  }

  // La méthode appelée par notre Guard
  isLoggedIn(): boolean {
    return this.authenticated;
  }
}
