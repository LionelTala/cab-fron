import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidatureService, Candidature } from '../../../services/candidature.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-candidatures',
  imports: [CommonModule, FormsModule],
  templateUrl: './candidatures.html',
  styleUrl: './candidatures.css',
})
export class Candidatures implements  OnInit {
  candidatures: Candidature[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Filtres
  filterStatut: string = 'tous';
  searchTerm: string = '';

  // Modal
  isModalOpen = false;
  selectedCandidature: Candidature | null = null;
  newStatut: string = '';

  // Statistiques
  stats = {
    total: 0,
    en_attente: 0,
    en_cours: 0,
    retenu: 0,
    admis: 0,
    refuse: 0
  };

  // Couleurs des statuts
  statutColors: Record<string, string> = {
    en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    en_cours: 'bg-blue-100 text-blue-800 border-blue-200',
    retenu: 'bg-purple-100 text-purple-800 border-purple-200',
    admis: 'bg-green-100 text-green-800 border-green-200',
    refuse: 'bg-red-100 text-red-800 border-red-200'
  };

  statutLabels: Record<string, string> = {
    en_attente: '📌 En attente',
    en_cours: '🔍 En cours',
    retenu: '⭐ Retenu',
    admis: '✅ Admis',
    refuse: '❌ Refusé'
  };

  constructor(
    private candidatureService: CandidatureService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCandidatures();
  }

  loadCandidatures(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.candidatureService.getCandidatures()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.candidatures = data;
          this.calculateStats();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = '❌ Impossible de charger les candidatures.';
          console.error('Erreur chargement candidatures:', err);
          this.cdr.detectChanges();
        }
      });
  }

  calculateStats(): void {
    this.stats.total = this.candidatures.length;
    this.stats.en_attente = this.candidatures.filter(c => c.statut === 'en_attente').length;
    this.stats.en_cours = this.candidatures.filter(c => c.statut === 'en_cours').length;
    this.stats.retenu = this.candidatures.filter(c => c.statut === 'retenu').length;
    this.stats.admis = this.candidatures.filter(c => c.statut === 'admis').length;
    this.stats.refuse = this.candidatures.filter(c => c.statut === 'refuse').length;
  }

  get filteredCandidatures(): Candidature[] {
  let result = this.candidatures;

  if (this.filterStatut !== 'tous') {
    result = result.filter(c => c.statut === this.filterStatut);
  }

  if (this.searchTerm.trim()) {
    const term = this.searchTerm.toLowerCase().trim();
    result = result.filter(c =>
      c.nom.toLowerCase().includes(term) ||
      c.prenom.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.formation_id?.toString().includes(term) ||
      c.formationRelation?.title.toLowerCase().includes(term) ||
      c.telephone.includes(term)
    );
  }

  return result;
}

  getStatutClass(statut: string): string {
    return this.statutColors[statut] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  getStatutLabel(statut: string): string {
    return this.statutLabels[statut] || statut;
  }

  openModal(candidature: Candidature): void {
    this.selectedCandidature = candidature;
    this.newStatut = candidature.statut || 'en_attente';
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedCandidature = null;
    document.body.style.overflow = '';
    this.cdr.detectChanges();
  }

  updateStatus(): void {
    if (!this.selectedCandidature || !this.newStatut) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.candidatureService.updateStatus(this.selectedCandidature.id!, this.newStatut)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.successMessage = `✅ Statut mis à jour : ${this.getStatutLabel(this.newStatut)}`;
          this.loadCandidatures();
          this.closeModal();

          setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 5000);
        },
        error: (err) => {
          this.errorMessage = '❌ Erreur lors de la mise à jour du statut.';
          console.error('Erreur update statut:', err);
          this.cdr.detectChanges();
        }
      });
  }

  deleteCandidature(id: number): void {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette candidature ? Cette action est irréversible.')) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.candidatureService.deleteCandidature(id)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.successMessage = '✅ Candidature supprimée avec succès !';
          this.loadCandidatures();

          setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 5000);
        },
        error: (err) => {
          this.errorMessage = '❌ Erreur lors de la suppression.';
          console.error('Erreur suppression:', err);
          this.cdr.detectChanges();
        }
      });
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
