import type { BubbleSignalementResponse, BubbleSignalement } from '@/types/mydata.types';
import { apiConfig } from '@/config/api.config';

/**
 * Service pour récupérer les signalements depuis l'API Bubble
 */
class SignalementsService {

  /**
   * Récupère la réponse complète (signalements + consignes IA) pour un rapport donné
   * @param rapportId - L'ID du rapport
   * @returns Promise avec la réponse complète
   */
  async fetchSignalementsResponse(rapportId: string): Promise<BubbleSignalementResponse> {
    try {
      const url = apiConfig.buildUrl('signalementlist', { rapportid: rapportId });

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

      console.log(`[SignalementsService] Fetched ${data.response.signalement.length} signalements, ${data.response.consigneIA?.length || 0} consignes IA`);

      return data;
    } catch (error) {
      console.error('[SignalementsService] Error fetching signalements:', error);
      // Retourner une réponse vide en cas d'erreur
      return {
        status: 'error',
        response: {
          signalement: [],
          consigneIA: []
        }
      };
    }
  }

  /**
   * Récupère la liste des signalements pour un rapport donné
   * @param rapportId - L'ID du rapport
   * @returns Promise avec la liste des signalements
   */
  async fetchSignalements(rapportId: string): Promise<BubbleSignalement[]> {
    const data = await this.fetchSignalementsResponse(rapportId);

    // Filtrer les signalements pour ne garder que ceux du rapport demandé
    const filteredSignalements = data.response.signalement.filter(
      sig => sig.rapport_ref === rapportId
    );

    console.log(`[SignalementsService] Filtered ${filteredSignalements.length} signalements for rapport ${rapportId}`);

    return filteredSignalements;
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

    // Tracker les signalements Bubble qui ont été fusionnés
    const mergedBubbleIds = new Set<string>();

    // Enrichir les signalements de base avec les données Bubble
    const enrichedBaseSignalements = baseSignalements.map(baseSig => {
      const bubbleSig = bubbleMap.get(baseSig.description);

      if (bubbleSig) {
        mergedBubbleIds.add(bubbleSig._id);
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

    // Ajouter les signalements Bubble qui n'ont pas été fusionnés
    const unmatchedBubbleSignalements = bubbleSignalements
      .filter(bubbleSig => !mergedBubbleIds.has(bubbleSig._id))
      .map(bubbleSig => ({
        signalement_id: bubbleSig._id,
        etape_id: null,
        room_id: bubbleSig.Piece_ref,
        titre: bubbleSig.typeText,
        commentaire: bubbleSig.description,
        img_url: bubbleSig.photo || null,
        img_base64: null,
        flow_type: 'user',
        origine: 'user',
        status: bubbleSig.OS_signalementStatut,
        priorite: bubbleSig.OS_signalementStatut === 'À traiter',
        created_at: this.timestampToISO(bubbleSig['Created Date']),
        updated_at: this.timestampToISO(bubbleSig['Modified Date']),
        description: bubbleSig.description,
        comment: bubbleSig.commentaireTraitement || '',
        timestamp: this.timestampToISO(bubbleSig['Created Date']),
        severity: this.mapStatusToSeverity(bubbleSig.OS_signalementStatut),
        signalement_type: 'direct',
        // Données enrichies supplémentaires
        typeText: bubbleSig.typeText,
        signaleur: {
          nom: bubbleSig['Nom signaleur'],
          prenom: bubbleSig['Prenom signaleur'],
          phone: bubbleSig['phone signaleur'],
        },
      }));

    // Retourner les signalements enrichis + les signalements Bubble non fusionnés
    return [...enrichedBaseSignalements, ...unmatchedBubbleSignalements];
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

