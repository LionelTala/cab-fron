import { Injectable } from '@angular/core';
import { env } from '../../env/env';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// ⭐ Déclaration globale pour Pusher
declare global {
  interface Window {
    Pusher: any;
  }
}

// ⭐ Interface pour le type Echo
interface EchoInstance {
  channel(channel: string): any;
  private(channel: string): any;
  join(channel: string): any;
  leave(channel: string): void;
  disconnect(): void;
}

@Injectable({
  providedIn: 'root'
})
export class PusherService {
  private echo: EchoInstance | null = null;

  constructor() {
    // ⭐ Initialisation de Pusher dans window
    window.Pusher = Pusher;

    // ⭐ Récupération des infos depuis env
    const pusherConfig = env.pusher;

    // ⭐ Vérification que les clés sont présentes
    if (!pusherConfig.key) {
      console.warn('⚠️ Pusher key manquante dans env.ts');
      return;
    }

    try {
      // ⭐ Initialisation de Echo
      this.echo = new Echo({
        broadcaster: 'pusher',
        key: pusherConfig.key,
        cluster: pusherConfig.cluster,
        wsHost: pusherConfig.host || `ws-${pusherConfig.cluster}.pusher.com`,
        wsPort: pusherConfig.port || 6001,
        wsPath: '/app',
        forceTLS: pusherConfig.forceTLS !== undefined ? pusherConfig.forceTLS : true,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
      } as any) as EchoInstance;

      console.log('✅ Pusher initialisé avec succès');
    } catch (error) {
      console.error('❌ Erreur initialisation Pusher:', error);
    }
  }

  /**
   * Écouter un événement sur un channel public
   */
  listen(channel: string, event: string, callback: (data: any) => void): void {
    if (this.echo) {
      try {
        this.echo.channel(channel).listen(event, callback);
      } catch (error) {
        console.error(`❌ Erreur d'écoute sur ${channel}:`, error);
      }
    } else {
      console.warn('⚠️ Echo non initialisé');
    }
  }

  /**
   * Quitter un channel
   */
  leave(channel: string): void {
    if (this.echo) {
      try {
        this.echo.leave(channel);
      } catch (error) {
        console.error(`❌ Erreur en quittant ${channel}:`, error);
      }
    }
  }

  /**
   * Écouter un événement sur un channel privé
   */
  listenPrivate(channel: string, event: string, callback: (data: any) => void): void {
    if (this.echo) {
      try {
        this.echo.private(channel).listen(event, callback);
      } catch (error) {
        console.error(`❌ Erreur d'écoute privée sur ${channel}:`, error);
      }
    }
  }

  /**
   * Écouter un événement sur un channel de présence
   */
  listenPresence(channel: string, event: string, callback: (data: any) => void): void {
    if (this.echo) {
      try {
        this.echo.join(channel).listen(event, callback);
      } catch (error) {
        console.error(`❌ Erreur d'écoute présence sur ${channel}:`, error);
      }
    }
  }

  /**
   * Déconnecter Echo
   */
  disconnect(): void {
    if (this.echo) {
      try {
        this.echo.disconnect();
        this.echo = null;
        console.log('✅ Echo déconnecté');
      } catch (error) {
        console.error('❌ Erreur déconnexion:', error);
      }
    }
  }
}
