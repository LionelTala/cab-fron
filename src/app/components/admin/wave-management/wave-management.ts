import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { WaveService, Wave } from '../../../services/wave';
import { FormationService, Formation } from '../../../services/formation';

@Component({
  selector: 'app-wave-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './wave-management.html',
  styleUrl: './wave-management.css',
})
export class WaveManagement implements OnInit {
  wavesList: Wave[] = [];
  formationsList: Formation[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;
  isModalOpen = false;

  // Formulaire du modal
  newWave: Partial<Wave> = {
    formation_id: 0,
    name: '',
    start_date: '',
    end_date: '',
    status: 'draft',
    is_active: true
  };

  constructor(
    private waveService: WaveService,
    private formationService: FormationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWaves();
    this.loadFormations();
  }

  loadFormations(): void {
    this.formationService.getFormations().subscribe({
      next: (data) => {
        this.formationsList = data.filter(f => f.is_active);
        this.cdr.detectChanges();
      },
      error: () => {
        console.error('Erreur chargement formations');
      }
    });
  }

  loadWaves(): void {
    this.isLoading = true;
    this.waveService.getWaves()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.wavesList = data;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Impossible de charger les vagues.';
          this.cdr.detectChanges();
        }
      });
  }

  openModal(): void {
    this.isModalOpen = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.newWave = {
      formation_id: 0,
      name: '',
      start_date: '',
      end_date: '',
      status: 'draft',
      is_active: true
    };
    this.cdr.detectChanges();
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.cdr.detectChanges();
    document.body.style.overflow = '';
  }

  setStatus(status: 'draft' | 'active' | 'completed' | 'cancelled'): void {
    this.newWave.status = status;
    this.cdr.detectChanges();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'draft': 'Brouillon',
      'active': 'Active',
      'completed': 'Terminée',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'draft': 'bg-slate-50 text-slate-600 border-slate-200',
      'active': 'bg-indigo-50 text-indigo-700 border-indigo-100',
      'completed': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'cancelled': 'bg-red-50 text-red-700 border-red-100'
    };
    return classes[status] || classes['draft'];
  }

  getStatusDot(status: string): string {
    const dots: Record<string, string> = {
      'draft': 'bg-slate-400',
      'active': 'bg-indigo-500',
      'completed': 'bg-emerald-500',
      'cancelled': 'bg-red-500'
    };
    return dots[status] || dots['draft'];
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.newWave.formation_id || this.newWave.formation_id === 0) {
      this.errorMessage = 'Veuillez sélectionner une formation.';
      return;
    }

    if (!this.newWave.name?.trim()) {
      this.errorMessage = 'Le nom de la cohorte est obligatoire.';
      return;
    }

    if (!this.newWave.start_date) {
      this.errorMessage = 'La date de début est obligatoire.';
      return;
    }

    if (!this.newWave.end_date) {
      this.errorMessage = 'La date de fin est obligatoire.';
      return;
    }

    // Vérification des dates
    const start = new Date(this.newWave.start_date);
    const end = new Date(this.newWave.end_date);

    if (end < start) {
      this.errorMessage = 'La date de fin doit être après la date de début.';
      return;
    }

    // Durée minimum 30 jours
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 30) {
      this.errorMessage = 'Une vague doit durer au minimum 30 jours.';
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.waveService.createWave(this.newWave)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.wavesList.unshift(res.wave);
          this.successMessage = 'Vague créée avec succès !';
          this.cdr.detectChanges();

          setTimeout(() => {
            this.closeModal();
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 1500);
        },
        error: (err) => {
          if (err.status === 422) {
            const errors = err.error?.errors;
            if (errors) {
              const firstError = Object.values(errors)[0];
              this.errorMessage = Array.isArray(firstError) ? firstError[0] : 'Erreur de validation.';
            } else {
              this.errorMessage = err.error?.message || 'Données invalides.';
            }
          } else if (err.status === 500) {
            this.errorMessage = 'Erreur serveur. Veuillez réessayer.';
          } else {
            this.errorMessage = err.error?.message || "Erreur d'enregistrement.";
          }
          this.cdr.detectChanges();
        }
      });
  }
}
