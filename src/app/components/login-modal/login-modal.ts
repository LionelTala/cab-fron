import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core'; // 1. Ajoutez ChangeDetectorRef
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-modal',
  imports: [FormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css',
})
export class LoginModal {
  @Output() closeModal = new EventEmitter<void>();

  loginData = { username: '', password: '' };
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  onSubmit(): void {
    // Nettoyage des espaces inutiles au début et à la fin (Trim)
    const username = this.loginData.username.trim();
    const password = this.loginData.password.trim();

    // 1. VALIDATION FRONTEND : Blocage si champs vides
    if (!username || !password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    // 2. VALIDATION FRONTEND : Sécurité sur la longueur du mot de passe
    if (password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    // Si les validations passent, on lance la requête
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    // On envoie les données nettoyées
    this.authService.login({ username, password })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Connexion réussie !', response?.user);
          this.closeModal.emit();
          const role = response?.user?.role;

          if (role === 'super-admin' || role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'student') {
            this.router.navigate(['/student/dashboard']);
          } else {
            this.errorMessage = 'Rôle utilisateur inconnu.';
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('Erreur brute reçue dans le composant:', err);

          if (err && err.error && err.error.error) {
            this.errorMessage = err.error.error;
          } else if (err.status === 401) {
            this.errorMessage = 'Identifiants incorrects. Veuillez vérifier vos accès.';
          } else if (err.status === 419) {
            this.errorMessage = 'Votre session a expiré. Veuillez rafraîchir la page.';
          } else {
            this.errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
          }
          this.cdr.detectChanges();
        }
      });
  }
}
