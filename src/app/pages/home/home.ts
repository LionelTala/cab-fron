import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  Inject,
  Renderer2,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { LoginModal } from '../../components/login-modal/login-modal';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidatureService, Candidature, FormationSimple } from '../../services/candidature.service';
import { finalize } from 'rxjs';

interface Formation {
  id: number;
  icon: string;
  title: string;
  accent: 'navy' | 'red';
  price: string;
  duree: string;
  tags: string[];
  slug: string;
  resume: string;
  programme: string[];
  debouches: string[];
}

interface Campus {
  ville: string;
  nom: string;
  adresse: string;
  tels: string[];
  mapsUrl: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LoginModal, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {

  // ===================== ÉTATS UI =====================
  isMobileMenuOpen = false;
  isLoginModalOpen = false;
  isLoading = true;
  loaderProgress = 0;
  isScrolled = false;
  selectedFormation: number | null = null;

  private revealObserver?: IntersectionObserver;
  private jsonLdScript?: HTMLScriptElement;

  // ===================== CANDIDATURE (Certification en ligne) =====================
  candidature: any = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    formation_id: '',
    niveau: '',
    message: ''
  };
  candidatureLoading = false;
  candidatureSuccess = false;
  candidatureSuccessMessage = '';
  candidatureError: string | null = null;
  formationsList: FormationSimple[] = [];
  formationsLoading = false;

  // ===================== CONTENU : FORMATIONS (vitrine) =====================
  formations: Formation[] = [
    {
      id: 0,
      icon: 'secretariat',
      title: 'Secrétariat Bureautique',
      accent: 'navy',
      price: '150 000 FCFA',
      duree: '8 mois + 2 mois de stage',
      tags: ['Cours du jour', 'Cours du soir'],
      slug: 'secretariat-bureautique',
      resume: 'Accueil, classement, correspondance et communication digitale pour devenir l\'assistant(e) indispensable de toute entreprise.',
      programme: [
        'Classement des dossiers',
        'Gestion de la correspondance',
        'Gestion du secrétariat et accueil',
        'Économie et organisation des entreprises',
        'Expression écrite et orale',
        'Communication digitale',
        'Formation bilingue (Anglais/Français)',
      ],
      debouches: [
        'Secrétaire publique',
        'Assistant(e) de direction',
        'Standardiste',
        'Gestionnaire de business center',
        'Secrétaire de PME/PMI',
        'Réceptionniste caissière',
        'Auto-emploi',
      ],
    },
    {
      id: 1,
      icon: 'comptable',
      title: 'Secrétariat Comptable',
      accent: 'red',
      price: '250 000 FCFA',
      duree: '8 mois + 2 mois de stage',
      tags: ['Cours du jour', 'Cours du soir'],
      slug: 'secretariat-comptable',
      resume: 'Comptabilité générale, fiscalité et états financiers SYSCOHADA pour piloter la gestion administrative d\'une entreprise.',
      programme: [
        'Comptabilité générale',
        'Comptabilité analytique',
        'Économie générale et EOE',
        'Mathématiques financières',
        'Comptabilité sur machine',
        'Pratique du secrétariat',
        'Fiscalité des entreprises',
        'ERP',
        'États financiers du SYSCOHADA',
      ],
      debouches: [
        'Aide-comptable',
        'Assistant(e) de direction',
        'Comptable',
        'Secrétaire comptable',
        'Secrétaire financière',
        'Auto-emploi',
      ],
    },
    {
      id: 2,
      icon: 'logistique',
      title: 'Logistique et Transit',
      accent: 'navy',
      price: '250 000 FCFA',
      duree: '8 mois + 2 mois de stage',
      tags: ['Cours du jour', 'Cours du soir'],
      slug: 'logistique-transit',
      resume: 'Opérations douanières, transport international et gestion des stocks pour rejoindre les métiers du port et de la logistique.',
      programme: [
        'Gestion des stocks sur SAGE',
        'Logistique industrielle et commerciale',
        'Technique des opérations de transport douanières',
        'Droit et contentieux du transport',
        'Commerce international',
        'Pratique logistique sur Excel',
      ],
      debouches: [
        'Consignataire',
        'Acconier',
        'Transitaire',
        'Logisticien',
        'Courtier maritime',
        'Gestionnaire des terminaux',
        'Gestionnaire de parc automobile',
      ],
    },
    {
      id: 3,
      icon: 'infographie',
      title: 'Infographie 2D & Multimédia',
      accent: 'red',
      price: '300 000 FCFA',
      duree: '8 mois + 2 mois de stage',
      tags: ['Cours du jour', 'Cours du soir'],
      slug: 'infographie-2d-multimedia',
      resume: 'Illustrator, Photoshop, InDesign et After Effects pour créer des visuels et gérer une communication digitale professionnelle.',
      programme: [
        'Initiation au graphisme',
        'Adobe Illustrator (création, colorimétrie, design)',
        'Adobe Photoshop (image numérique, habillage, effets)',
        'Adobe InDesign (mise en page, colorimétrie)',
        'Animation basique FX (After Effects)',
        'Habillage graphique, effets spéciaux, initiation 3D',
        'Internet appliqué au graphisme',
        'Techniques multimédia',
      ],
      debouches: [
        'Graphiste digital',
        'Gestionnaire de médias sociaux',
        'Web designer',
        'Éditeur de pages digitales',
        'Webmarketeur',
        'Assistant marketing',
        'Chargé de communication digitale',
        'Auto-emploi',
      ],
    },
    {
      id: 4,
      icon: 'reseaux',
      title: 'Réseaux & Maintenance Informatique',
      accent: 'navy',
      price: '300 000 FCFA',
      duree: '8 mois + 2 mois de stage',
      tags: ['Cours du jour', 'Cours du soir'],
      slug: 'reseaux-maintenance-informatique',
      resume: 'Assemblage, dépannage et administration réseau pour devenir le technicien informatique que chaque entreprise recherche.',
      programme: [
        'Assemblage des ordinateurs',
        'Architecture des ordinateurs',
        'Réseaux et administration systèmes',
        'Diagnostic des périphériques et accessoires',
        'Consignes de sécurité',
        'Diagnostic et dépannage logiciel et matériel',
        'Systèmes d\'exploitation',
      ],
      debouches: [
        'Responsable informatique',
        'Technicien en maintenance',
        'Responsable S.A.V',
        'Sous-traitant pour entreprises',
        'Vendeur de matériel informatique',
        'Auto-emploi',
      ],
    },
    {
      id: 5,
      icon: 'videosurveillance',
      title: 'Vidéosurveillance',
      accent: 'red',
      price: '300 000 FCFA',
      duree: '8 mois + 2 mois de stage',
      tags: ['Cours du jour', 'Cours du soir'],
      slug: 'videosurveillance',
      resume: 'Installation, configuration et maintenance de systèmes de vidéosurveillance IP et analogique, du câblage à l\'accès à distance.',
      programme: [
        'Principes de base de la vidéosurveillance',
        'Types de caméras (analogiques, IP, PTZ, etc.)',
        'Installation des caméras et câblage',
        'Configuration des DVR / NVR',
        'Configuration des caméras IP',
        'Accès à distance (mobile & PC)',
        'Paramétrage des enregistrements',
        'Maintenance et dépannage',
        'Sécurité des systèmes',
        'Études de cas pratiques',
      ],
      debouches: [
        'Technicien en vidéosurveillance',
        'Installateur de systèmes de sécurité',
        'Responsable sécurité électronique',
        'Intégrateur de solutions de sécurité',
        'Auto-entrepreneur en sécurité',
        'Vendeur de matériel de sécurité',
        'Consultant en vidéosurveillance',
      ],
    },
  ];

  // ===================== CONTENU : CAMPUS =====================
  campuses: Campus[] = [
    {
      ville: 'Douala',
      nom: 'Campus de Yassa',
      adresse: 'ELF, à 100 m de l\'Échangeur en allant vers l\'Aéroport',
      tels: ['+237 675 64 77 39', '+237 653 37 74 19'],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=CAB+Informatique+Yassa+Douala',
    },
    {
      ville: 'Yaoundé',
      nom: 'Campus de Nlongkak',
      adresse: 'À 100 m du rond-point Nlongkak, en face de MINDEVEL',
      tels: ['+237 656 83 13 88', '+237 677 83 52 28'],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=CAB+Informatique+Nlongkak+Yaound%C3%A9',
    },
    {
      ville: 'Bafoussam',
      nom: 'Campus de Casablanca',
      adresse: 'Marché flépri Casablanca, Immeuble Pharmacie de l\'Espérance',
      tels: ['+237 659 02 74 16', '+237 674 53 22 15'],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=CAB+Informatique+Casablanca+Bafoussam',
    },
  ];

  readonly whatsappNumber = '237677835228';
  readonly telPrincipal = '+237690666245';
  readonly emailContact = 'cabinfo2@gmail.com';
  readonly currentYear = new Date().getFullYear();
  readonly foundingYear = 2004;

  get selectedFormationData(): Formation | null {
    return this.selectedFormation !== null ? this.formations[this.selectedFormation] : null;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private title: Title,
    private meta: Meta,
    private renderer: Renderer2,
    private candidatureService: CandidatureService,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  // ===================== LIFECYCLE =====================
  ngOnInit(): void {
    this.simulateLoader();
    this.setSeo();
    this.loadFormationsForCandidature();
  }

  ngAfterViewInit(): void {
    this.initScrollReveal();
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
    this.revealObserver?.disconnect();
    if (this.jsonLdScript) {
      this.renderer.removeChild(this.document.head, this.jsonLdScript);
    }
  }

  // ===================== CHARGEMENT DES FORMATIONS POUR LE FORMULAIRE =====================
  loadFormationsForCandidature(): void {
    this.formationsLoading = true;
    this.candidatureService.getFormations()
      .pipe(finalize(() => {
        this.formationsLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.formationsList = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur chargement formations:', err);
          this.cdr.detectChanges();
        }
      });
  }

  // ===================== SEO =====================
  private setSeo(): void {
    const title = 'CAB Informatique | Centre de Formation Professionnelle à Douala, Yaoundé, Bafoussam';
    const description =
      'CAB Informatique forme aux métiers de l\'informatique et du tertiaire depuis 2004 : infographie, réseaux, vidéosurveillance, secrétariat comptable, logistique et transit. Rentrée 2026-2027, inscriptions ouvertes à Douala, Yaoundé et Bafoussam.';
    const url = 'https://cab-informatique.com/';
    const image = 'https://cab-informatique.com/assets/og-cab-informatique.jpg';

    this.title.setTitle(title);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({
      name: 'keywords',
      content:
        'CAB Informatique, formation infographie Douala, formation vidéosurveillance Cameroun, secrétariat comptable Douala, réseau maintenance Yaoundé, centre de formation professionnelle Cameroun, école informatique Bafoussam',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ name: 'author', content: 'CAB Informatique' });

    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:site_name', content: 'CAB Informatique' });
    this.meta.updateTag({ property: 'og:locale', content: 'fr_CM' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    this.setCanonical(url);
    this.injectStructuredData(url);
  }

  private setCanonical(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'canonical');
      this.renderer.appendChild(this.document.head, link);
    }
    this.renderer.setAttribute(link, 'href', url);
  }

  private injectStructuredData(url: string): void {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'CAB Informatique',
      alternateName: 'CAB Informatique - Notre désir, Votre Professionnalisme',
      description: 'Centre de formation professionnelle en informatique et gestion, présent au Cameroun depuis 2004.',
      url,
      logo: 'https://cab-informatique.com/assets/logo-cab-informatique.png',
      foundingDate: '2004',
      telephone: this.telPrincipal,
      email: this.emailContact,
      sameAs: [`https://wa.me/${this.whatsappNumber}`],
      department: this.campuses.map((c) => ({
        '@type': 'EducationalOrganization',
        name: `CAB Informatique - ${c.nom}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: c.adresse,
          addressLocality: c.ville,
          addressCountry: 'CM',
        },
        telephone: c.tels[0],
      })),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Formations professionnelles CAB Informatique',
        itemListElement: this.formations.map((f) => ({
          '@type': 'Course',
          name: f.title,
          description: f.resume,
          provider: { '@type': 'EducationalOrganization', name: 'CAB Informatique' },
        })),
      },
    };

    this.jsonLdScript = this.renderer.createElement('script');
    this.renderer.setAttribute(this.jsonLdScript, 'type', 'application/ld+json');
    this.renderer.appendChild(
      this.jsonLdScript,
      this.renderer.createText(JSON.stringify(data)),
    );
    this.renderer.appendChild(this.document.head, this.jsonLdScript);
  }

  // ===================== LOADER =====================
  simulateLoader(): void {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          this.isLoading = false;
          this.loaderProgress = 100;
          this.cdr.detectChanges();
        }, 300);
      }
      this.loaderProgress = Math.min(progress, 100);
      this.cdr.detectChanges();
    }, 200);
  }

  // ===================== SCROLL DETECTION & REVEAL =====================
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  private initScrollReveal(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = this.document.querySelectorAll('[data-reveal]');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            this.revealObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    targets.forEach((el) => this.revealObserver?.observe(el));
  }

  // ===================== MENU MOBILE =====================
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.document.body.style.overflow = '';
  }

  // ===================== MODAL CONNEXION =====================
  openLoginModal(): void {
    this.isLoginModalOpen = true;
    this.document.body.style.overflow = 'hidden';
  }

  closeLoginModal(): void {
    this.isLoginModalOpen = false;
    this.document.body.style.overflow = '';
  }

  // ===================== NAVIGATION =====================
  scrollTo(sectionId: string): void {
    const element = this.document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.closeMobileMenu();
  }

  // ===================== MODAL FORMATION =====================
  openModal(index: number): void {
    this.selectedFormation = index;
    this.document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.selectedFormation = null;
    this.document.body.style.overflow = '';
  }

  whatsappLink(formationTitle?: string): string {
    const base = `https://wa.me/${this.whatsappNumber}`;
    if (!formationTitle) {
      return `${base}?text=${encodeURIComponent('Bonjour, je souhaite avoir des informations sur les formations CAB Informatique.')}`;
    }
    return `${base}?text=${encodeURIComponent(`Bonjour, je souhaite m'inscrire à la formation ${formationTitle}.`)}`;
  }

  // ===================== SOUMISSION CANDIDATURE =====================
  onCandidatureSubmit(): void {
    this.candidatureError = null;
    this.candidatureSuccess = false;
    this.candidatureSuccessMessage = '';

    // Validation frontend
    if (!this.candidature.nom?.trim()) {
      this.candidatureError = '❌ Le nom est obligatoire.';
      this.scrollToCandidature();
      return;
    }
    if (!this.candidature.prenom?.trim()) {
      this.candidatureError = '❌ Le prénom est obligatoire.';
      this.scrollToCandidature();
      return;
    }
    if (!this.candidature.email?.trim() || !this.isValidEmail(this.candidature.email)) {
      this.candidatureError = '❌ Veuillez entrer un email valide (ex: nom@domaine.com).';
      this.scrollToCandidature();
      return;
    }
    if (!this.candidature.telephone?.trim()) {
      this.candidatureError = '❌ Le numéro de téléphone est obligatoire.';
      this.scrollToCandidature();
      return;
    }
    if (!this.candidature.formation_id) {
      this.candidatureError = '❌ Veuillez sélectionner la formation souhaitée.';
      this.scrollToCandidature();
      return;
    }
    if (!this.candidature.niveau) {
      this.candidatureError = '❌ Veuillez sélectionner votre niveau scolaire.';
      this.scrollToCandidature();
      return;
    }

    this.candidatureLoading = true;
    this.cdr.detectChanges();

    const payload = {
      ...this.candidature,
      formation_id: parseInt(this.candidature.formation_id)
    };

    this.candidatureService.submitCandidature(payload)
      .pipe(finalize(() => {
        this.candidatureLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.candidatureSuccess = true;
          this.candidatureSuccessMessage = '✅ ' + (res.message || 'Votre candidature a été envoyée avec succès ! Nous vous recontacterons par email ou WhatsApp sous 48h.');
          this.candidatureError = null;

          // Réinitialiser le formulaire
          this.candidature = {
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            formation_id: '',
            niveau: '',
            message: ''
          };
          this.cdr.detectChanges();

          setTimeout(() => {
            this.scrollToCandidature();
          }, 100);

          setTimeout(() => {
            this.candidatureSuccess = false;
            this.candidatureSuccessMessage = '';
            this.cdr.detectChanges();
          }, 10000);
        },
        error: (err) => {
          console.error('Erreur candidature:', err);

          if (err.status === 422) {
            const errors = err.error?.errors;
            if (errors) {
              const messages = Object.values(errors).flat();
              this.candidatureError = '❌ ' + messages.join(', ');
            } else {
              this.candidatureError = '❌ ' + (err.error?.message || 'Données invalides. Vérifiez les champs.');
            }
          } else if (err.status === 500) {
            this.candidatureError = '❌ Erreur serveur. Veuillez réessayer dans quelques instants.';
          } else {
            this.candidatureError = '❌ ' + (err.error?.message || 'Une erreur est survenue. Veuillez réessayer.');
          }
          this.cdr.detectChanges();

          setTimeout(() => {
            this.scrollToCandidature();
          }, 100);
        }
      });
  }

  private scrollToCandidature(): void {
    const element = this.document.getElementById('certification');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private isValidEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }
}