// formation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../env/env';

export interface Formation {
    id?: number;
    code: string;
    title: string;
    slug?: string;
    description: string | null;
    duree_formation: number;
    prix: number;            // ⭐ Frais d'inscription (affiché en front)
    frais_scolarite: number; // ⭐ Frais de scolarité
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class FormationService {
    private apiUrl = `${env.apiUrl}/formations`;

    constructor(private http: HttpClient) {}

    getFormations(): Observable<Formation[]> {
        return this.http.get<Formation[]>(this.apiUrl);
    }

    getFormation(id: number): Observable<Formation> {
        return this.http.get<Formation>(`${this.apiUrl}/${id}`);
    }

    createFormation(formation: Partial<Formation>): Observable<{ message: string; formation: Formation }> {
        return this.http.post<{ message: string; formation: Formation }>(this.apiUrl, formation);
    }

    updateFormation(id: number, formation: Partial<Formation>): Observable<{ message: string; formation: Formation }> {
        return this.http.put<{ message: string; formation: Formation }>(`${this.apiUrl}/${id}`, formation);
    }

    deleteFormation(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
    }
}
