import type { BubbleSignalementResponse, BubbleSignalement } from '@/types/mydata.types';

/**
 * Service pour récupérer les signalements depuis l'API Bubble
 */
class SignalementsService {
  private readonly API_BASE_URL = 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf';

  /**
   * Récupère la liste des signalements pour un rapport donné
   * @param rapportId - L'ID du rapport
   * @returns Promise avec la liste des signalements
   */
  async fetchSignalements(rapportId: string): Promise<BubbleSignalement[]> {
    try {
      const url = `${this.API_BASE_URL}/signalementlist?rapportid=${rapportId}`;

      console.log(`[SignalementsService] Fetching signalements for rapportid: ${rapportId}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BubbleSignalementResponse = await response.json();

      if (data.status !== 'success') {
        throw new Error(`API returned error status: ${data.status}`);
      }

      // Filtrer les signalements pour ne garder que ceux du rapport demandé
      const filteredSignalements = data.response.signalement.filter(
        sig => sig.rapport_ref === rapportId
      );

      console.log(`[SignalementsService] Fetched ${data.response.signalement.length} signalements total, ${filteredSignalements.length} for rapport ${rapportId}`);

      return filteredSignalements;
    } catch (error) {
      console.error('[SignalementsService] Error fetching signalements:', error);
      // Retourner un tableau vide en cas d'erreur pour ne pas bloquer l'application
      return [];
    }
  }

  /**
   * Convertit un timestamp Unix (millisecondes) en ISO string
   */
  private timestampToISO(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }

  /**
   * Enrichit les signalements de base avec les données de l'API Bubble
   * @param baseSignalements - Signalements de base depuis mydata.json
   * @param bubbleSignalements - Signalements enrichis depuis l'API Bubble
   * @returns Signalements fusionnés
   */
  mergeSignalements(
    baseSignalements: Array<{ id: string; description: string; photo_url?: string; photo_base64?: string; timestamp: string }>,
    bubbleSignalements: BubbleSignalement[]
  ) {
    // Créer une map des signalements Bubble par description pour faciliter la fusion
    const bubbleMap = new Map<string, BubbleSignalement>();
    bubbleSignalements.forEach(sig => {
      bubbleMap.set(sig.description, sig);
    });

    // Enrichir les signalements de base avec les données Bubble
    return baseSignalements.map(baseSig => {
      const bubbleSig = bubbleMap.get(baseSig.description);
      
      if (bubbleSig) {
        return {
          signalement_id: bubbleSig._id,
          etape_id: null,
          room_id: bubbleSig.Piece_ref,
          titre: bubbleSig.typeText,
          commentaire: bubbleSig.description,
          img_url: bubbleSig.photo || baseSig.photo_url || null,
          img_base64: baseSig.photo_base64 || null,
          flow_type: 'user',
          origine: 'user',
          status: bubbleSig.OS_signalementStatut,
          priorite: bubbleSig.OS_signalementStatut === 'À traiter',
          created_at: this.timestampToISO(bubbleSig['Created Date']),
          updated_at: this.timestampToISO(bubbleSig['Modified Date']),
          description: bubbleSig.description,
          comment: '',
          timestamp: baseSig.timestamp,
          severity: this.mapStatusToSeverity(bubbleSig.OS_signalementStatut),
          signalement_type: 'direct',
          // Données enrichies supplémentaires
          typeText: bubbleSig.typeText,
          signaleur: {
            nom: bubbleSig['Nom signaleur'],
            prenom: bubbleSig['Prenom signaleur'],
            phone: bubbleSig['phone signaleur'],
          },
        };
      }

      // Si pas de correspondance Bubble, retourner le signalement de base
      return {
        signalement_id: baseSig.id,
        etape_id: null,
        room_id: '',
        titre: 'Signalement',
        commentaire: baseSig.description,
        img_url: baseSig.photo_url || null,
        img_base64: baseSig.photo_base64 || null,
        flow_type: 'user',
        origine: 'user',
        status: 'À traiter',
        priorite: true,
        created_at: baseSig.timestamp,
        updated_at: baseSig.timestamp,
        description: baseSig.description,
        comment: '',
        timestamp: baseSig.timestamp,
        severity: 'moyenne',
        signalement_type: 'direct',
      };
    });
  }

  /**
   * Mappe le statut Bubble vers une sévérité
   */
  private mapStatusToSeverity(status: string): string {
    switch (status) {
      case 'À traiter':
        return 'elevee';
      case 'En cours':
        return 'moyenne';
      case 'Résolu':
        return 'faible';
      default:
        return 'moyenne';
    }
  }
}

/**
 * Instance singleton du service de signalements
 */
export const signalementsService = new SignalementsService();

