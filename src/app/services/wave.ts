import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../env/env';

export interface Wave {
  id?: number;
  formation_id: number;
  code_vague?: string;      // ⭐ Optionnel car généré par le backend
  name: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  is_active?: boolean;
  formation?: {
    id: number;
    title: string;
    code: string;
    prix_formation: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WaveService {
  private apiUrl = `${env.apiUrl}/waves`;

  constructor(private http: HttpClient) {}

  getWaves(): Observable<Wave[]> {
    return this.http.get<Wave[]>(this.apiUrl);
  }

  createWave(wave: Partial<Wave>): Observable<{ message: string; wave: Wave }> {
    return this.http.post<{ message: string; wave: Wave }>(this.apiUrl, wave);
  }

  updateWave(id: number, wave: Partial<Wave>): Observable<{ message: string; wave: Wave }> {
    return this.http.put<{ message: string; wave: Wave }>(`${this.apiUrl}/${id}`, wave);
  }

  deleteWave(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  changeStatus(id: number, status: string): Observable<{ message: string; wave: Wave }> {
    return this.http.patch<{ message: string; wave: Wave }>(`${this.apiUrl}/${id}/status`, { status });
  }
}
