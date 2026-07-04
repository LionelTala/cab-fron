import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-overview',
  imports: [CommonModule],
  templateUrl: './admin-overview.html',
  styleUrl: './admin-overview.css',
})
export class AdminOverview {
   stats = {
    totalEtudiants: 156,
    totalFormations: 6,
    totalVagues: 8,
    candidaturesRecues: 24,
    candidaturesEnAttente: 7
  };

  // Dernières activités (simples)
  dernieresActivites = [
    { action: 'Nouvelle candidature', details: 'Sikali Lionel - Infographie 2D', date: 'Il y a 2h' },
    { action: 'Candidature validée', details: 'Tchoumi Paul - Réseaux & Maintenance', date: 'Il y a 5h' },
    { action: 'Nouvelle vague', details: 'Vague Mars 2026 - Infographie', date: 'Il y a 1j' },
    { action: 'Étudiant inscrit', details: 'Ndi Sophie - Vidéosurveillance', date: 'Il y a 2j' },
    { action: 'Formation créée', details: 'Vidéosurveillance', date: 'Il y a 3j' }
  ];
}
