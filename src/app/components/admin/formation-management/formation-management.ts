// formation-management.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Formation, FormationService } from '../../../services/formation';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-formation-management',
    imports: [CommonModule, FormsModule],
    templateUrl: './formation-management.html',
    styleUrl: './formation-management.css',
})
export class FormationManagement implements OnInit {
    formationsList: Formation[] = [];
    errorMessage: string | null = null;
    successMessage: string | null = null;
    isLoading = false;
    isModalOpen = false;
    isDeleteModalOpen = false;
    isEditMode = false;
    selectedFormationId: number | null = null;
    formationToDelete: Formation | null = null;

    newFormation: Partial<Formation> = {
        code: '',
        title: '',
        description: '',
        duree_formation: 12,
        prix: 0,
        frais_scolarite: 0,
        is_active: true
    };

    constructor(
        private formationService: FormationService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadFormations();
    }

    loadFormations(): void {
        this.isLoading = true;
        this.formationService.getFormations()
            .pipe(finalize(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (data) => {
                    this.formationsList = data;
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.errorMessage = 'Impossible de charger les formations.';
                    this.cdr.detectChanges();
                }
            });
    }

    // ===================== MODAL AJOUT / ÉDITION =====================
    openModal(formation?: Formation): void {
        this.isModalOpen = true;
        this.errorMessage = null;
        this.successMessage = null;
        document.body.style.overflow = 'hidden';

        if (formation) {
            this.isEditMode = true;
            this.selectedFormationId = formation.id!;
            this.newFormation = {
                code: formation.code,
                title: formation.title,
                description: formation.description,
                duree_formation: formation.duree_formation,
                prix: formation.prix,
                frais_scolarite: formation.frais_scolarite,
                is_active: formation.is_active
            };
        } else {
            this.isEditMode = false;
            this.selectedFormationId = null;
            this.newFormation = {
                code: '',
                title: '',
                description: '',
                duree_formation: 12,
                prix: 0,
                frais_scolarite: 0,
                is_active: true
            };
        }
        this.cdr.detectChanges();
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.cdr.detectChanges();
        document.body.style.overflow = '';
    }

    // ===================== SUPPRESSION =====================
    openDeleteModal(formation: Formation): void {
        this.formationToDelete = formation;
        this.isDeleteModalOpen = true;
        document.body.style.overflow = 'hidden';
        this.cdr.detectChanges();
    }

    closeDeleteModal(): void {
        this.isDeleteModalOpen = false;
        this.formationToDelete = null;
        document.body.style.overflow = '';
        this.cdr.detectChanges();
    }

    confirmDelete(): void {
        if (!this.formationToDelete?.id) return;

        this.isLoading = true;
        this.cdr.detectChanges();

        this.formationService.deleteFormation(this.formationToDelete.id)
            .pipe(finalize(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: () => {
                    this.formationsList = this.formationsList.filter(
                        f => f.id !== this.formationToDelete?.id
                    );
                    this.successMessage = 'Formation supprimée avec succès !';
                    this.closeDeleteModal();
                    this.cdr.detectChanges();

                    setTimeout(() => {
                        this.successMessage = null;
                        this.cdr.detectChanges();
                    }, 3000);
                },
                error: (err) => {
                    this.errorMessage = err.error?.message || 'Erreur lors de la suppression.';
                    this.cdr.detectChanges();
                }
            });
    }

    // ===================== SOUMISSION =====================
    onSubmit(): void {
        this.errorMessage = null;
        this.successMessage = null;

        if (!this.newFormation.code?.trim()) {
            this.errorMessage = 'Le code est obligatoire.';
            return;
        }

        if (!this.newFormation.title?.trim()) {
            this.errorMessage = 'Le titre est obligatoire.';
            return;
        }

        if (!this.newFormation.duree_formation || this.newFormation.duree_formation < 1) {
            this.errorMessage = 'La durée doit être d\'au moins 1 mois.';
            return;
        }

        if (this.newFormation.prix === undefined || this.newFormation.prix < 0) {
            this.errorMessage = 'Les frais d\'inscription doivent être supérieurs ou égaux à 0.';
            return;
        }

        if (this.newFormation.frais_scolarite === undefined || this.newFormation.frais_scolarite < 0) {
            this.errorMessage = 'Les frais de scolarité doivent être supérieurs ou égaux à 0.';
            return;
        }

        this.isLoading = true;
        this.cdr.detectChanges();

        const request$ = this.isEditMode && this.selectedFormationId
            ? this.formationService.updateFormation(this.selectedFormationId!, this.newFormation)
            : this.formationService.createFormation(this.newFormation);

        request$
            .pipe(finalize(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (res) => {
                    if (this.isEditMode) {
                        const index = this.formationsList.findIndex(f => f.id === this.selectedFormationId);
                        if (index !== -1) {
                            this.formationsList[index] = res.formation;
                        }
                        this.successMessage = 'Formation mise à jour avec succès !';
                    } else {
                        this.formationsList.unshift(res.formation);
                        this.successMessage = 'Formation créée avec succès !';
                    }

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

    // ===================== NAVIGATION =====================
    goToWaves(formationId: number): void {
        this.router.navigate(['/admin/dashboard/waves'], { queryParams: { formation: formationId } });
    }

    // ===================== FORMATAGE =====================
    formatPrice(price: number): string {
        return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
    }

    getStatusClass(isActive: boolean): string {
        return isActive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-slate-50 text-slate-600 border-slate-200';
    }

    getStatusDot(isActive: boolean): string {
        return isActive ? 'bg-emerald-500' : 'bg-slate-400';
    }

    getStatusLabel(isActive: boolean): string {
        return isActive ? 'Actif' : 'Inactif';
    }
}
