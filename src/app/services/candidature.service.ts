import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../env/env';

export interface FormationSimple {
  id: number;
  title: string;
}

export interface Candidature {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  formation_id?: number;
  niveau: string;
  message?: string;
  statut?: 'en_attente' | 'en_cours' | 'retenu' | 'admis' | 'refuse';
  created_at?: string;
  updated_at?: string;
  formationRelation?: FormationSimple;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private apiUrl = `${env.apiUrl}/candidatures`;

  constructor(private http: HttpClient) {}

  getFormations(): Observable<FormationSimple[]> {
    return this.http.get<FormationSimple[]>(`${this.apiUrl}/formations`);
  }

  submitCandidature(data: Partial<Candidature>): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getCandidatures(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(this.apiUrl);
  }

  getCandidature(id: number): Observable<Candidature> {
    return this.http.get<Candidature>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, statut: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { statut });
  }

  validateCandidature(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/validate`, { statut: 'admis' });
  }

  deleteCandidature(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
