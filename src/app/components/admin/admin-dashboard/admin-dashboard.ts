import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CandidatureService } from '../../../services/candidature.service';
import { PusherService } from '../../../services/pusher-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit, OnDestroy {

  isSidebarOpen = false;
  candidaturesEnAttente = 0;
  isLoading = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private candidatureService: CandidatureService,
    private pusherService: PusherService
  ) {}

  ngOnInit(): void {
    this.loadCandidaturesEnAttente();
    this.listenToNewCandidatures();
  }

  ngOnDestroy(): void {
    // ⭐ Quitter le channel Pusher
    this.pusherService.leave('admin-candidatures');
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.cdr.detectChanges();
  }

  onLogout(): void {
    console.log('Déconnexion demandée');
    // Logique de déconnexion à ajouter
  }

  /**
   * Charger le nombre de candidatures en attente
   */
  loadCandidaturesEnAttente(): void {
    this.isLoading = true;
    this.candidatureService.getCandidatures()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.candidaturesEnAttente = data.filter(c => c.statut === 'en_attente').length;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Erreur chargement compteur:', err);
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Écouter les nouvelles candidatures en temps réel
   */
  listenToNewCandidatures(): void {
    this.pusherService.listen('admin-candidatures', 'candidature.recue', (data: any) => {
      console.log('🔔 Nouvelle candidature reçue !', data);
      this.candidaturesEnAttente = data.count || 0;
      this.cdr.detectChanges();
    });
  }
}
