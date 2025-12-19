import type { RapportDataJSON } from '@/types/rapport.types';
import type { MyDataJSON, Piece, Etape, Signalement, BubbleSignalement } from '@/types/mydata.types';
import { signalementsService } from './signalementsService';
import { myDataService } from './mydataService';
import { aiDataService } from './aiDataService';
import { fullDataService, type FullDataResponse } from './fullDataService';

/**
 * Interface pour les données fusionnées
 * Combine les données IA (data.json) avec les données brutes (mydata.json)
 */
export interface FusedRapportData extends RapportDataJSON {
  // Données brutes du parcours
  rawData: {
    agent: MyDataJSON['agent'];
    parcours: MyDataJSON['parcours'];
    checkin: MyDataJSON['checkin'];
    signalements: MyDataJSON['signalements'];
    timestamps?: MyDataJSON['timestamps'];  // Timestamps du parcours
    bubbleSignalements?: BubbleSignalement[];  // Signalements enrichis depuis l'API Bubble
  };
  // Mapping des pièces avec leurs données brutes
  piecesWithRawData: Map<string, {
    aiData: RapportDataJSON['detailParPieceSection'][0];
    rawPiece: Piece;
    etapes: Etape[];
    signalements: Signalement[];
  }>;
  // Données complètes depuis l'endpoint fulldata
  fullData?: FullDataResponse;
}

/**
 * Service de fusion des données
 * Combine les données IA (data.json) avec les données brutes du parcours (mydata.json)
 */
export class DataFusionService {
  /**
   * Charge et fusionne les données d'analyse IA et mydata depuis l'API
   * Récupère également les signalements enrichis depuis l'API Bubble
   */
  async loadAndFuseData(): Promise<FusedRapportData> {
    try {
      // Récupérer l'ID du rapport depuis l'URL
      const rapportId = aiDataService.getRapportIdFromUrl();

      if (!rapportId) {
        throw new Error(
          'Paramètre "rapport" manquant dans l\'URL. ' +
          'Exemple d\'URL attendue: http://localhost:8080?rapport=1763564845575x702792386204432800'
        );
      }

      console.log(`[DataFusionService] Chargement des données pour le rapport: ${rapportId}`);

      // Charger toutes les données en parallèle
      const [aiData, rawData, bubbleSignalements, fullData] = await Promise.all([
        aiDataService.fetchAiData(rapportId),
        myDataService.fetchMyData(rapportId),
        signalementsService.fetchSignalements(rapportId),
        fullDataService.fetchFullData(rapportId)
      ]);

      console.log('[DataFusionService] Toutes les données ont été chargées avec succès');

      // Fusionner les données
      return this.fuseData(aiData, rawData, bubbleSignalements, fullData);
    } catch (error) {
      console.error('[DataFusionService] Erreur lors du chargement et de la fusion des données:', error);
      throw error;
    }
  }

  /**
   * Fusionne les données IA avec les données brutes, les signalements Bubble et les données complètes
   */
  private fuseData(
    aiData: RapportDataJSON,
    rawData: MyDataJSON,
    bubbleSignalements: BubbleSignalement[],
    fullData: FullDataResponse
  ): FusedRapportData {
    // Créer un mapping des pièces brutes par ID
    const rawPiecesMap = new Map<string, Piece>();
    if (rawData.checkin && rawData.checkin.pieces) {
      rawData.checkin.pieces.forEach(piece => {
        rawPiecesMap.set(piece.piece_id, piece);
      });
    }

    // Enrichir les signalements de base avec les données Bubble
    // Mapper les signalements au format attendu par mergeSignalements
    const baseSignalements = (rawData.signalements || []).map(sig => ({
      id: sig.signalement_id,
      description: sig.description,
      photo_url: sig.img_url || undefined,
      photo_base64: sig.img_base64 || undefined,
      timestamp: sig.timestamp
    }));

    const enrichedSignalements = signalementsService.mergeSignalements(
      baseSignalements,
      bubbleSignalements
    );

    // Créer un mapping des signalements par room_id (Piece_ref)
    const signalementsByRoom = new Map<string, Signalement[]>();

    // Ajouter les signalements enrichis
    enrichedSignalements.forEach(signalement => {
      const roomId = signalement.room_id;
      if (roomId) {
        if (!signalementsByRoom.has(roomId)) {
          signalementsByRoom.set(roomId, []);
        }
        signalementsByRoom.get(roomId)!.push(signalement);
      }
    });

    // Créer le mapping des pièces avec leurs données brutes
    const piecesWithRawData = new Map();

    aiData.detailParPieceSection.forEach(aiPiece => {
      const rawPiece = rawPiecesMap.get(aiPiece.id);
      const signalements = signalementsByRoom.get(aiPiece.id) || [];

      piecesWithRawData.set(aiPiece.id, {
        aiData: aiPiece,
        rawPiece: rawPiece || null,
        etapes: rawPiece?.etapes || [],
        signalements: signalements
      });
    });

    // Retourner les données fusionnées
    return {
      ...aiData,
      rawData: {
        agent: rawData.agent,
        parcours: rawData.parcours,
        checkin: rawData.checkin,
        signalements: enrichedSignalements,
        timestamps: rawData.timestamps,
        bubbleSignalements: bubbleSignalements  // Ajouter les signalements Bubble bruts
      },
      piecesWithRawData
    };
  }

  /**
   * Récupère les étapes d'une pièce spécifique
   */
  getEtapesForPiece(fusedData: FusedRapportData, pieceId: string): Etape[] {
    const pieceData = fusedData.piecesWithRawData.get(pieceId);
    return pieceData?.etapes || [];
  }

  /**
   * Récupère les signalements d'une pièce spécifique
   */
  getSignalementsForPiece(fusedData: FusedRapportData, pieceId: string): Signalement[] {
    const pieceData = fusedData.piecesWithRawData.get(pieceId);
    return pieceData?.signalements || [];
  }

  /**
   * Vérifie si une étape contient une image
   * Une étape a une image si :
   * - type === 'photo_taken' OU
   * - type === 'button_click' ET (photo_url OU photo_base64 est non vide/null)
   */
  private hasImage(etape: Etape): boolean {
    if (etape.type === 'photo_taken') {
      return true;
    }

    if (etape.type === 'button_click') {
      const hasPhotoUrl = !!(etape.photo_url && etape.photo_url.trim() !== '');
      const hasPhotoBase64 = !!(etape.photo_base64 && etape.photo_base64.trim() !== '');
      return hasPhotoUrl || hasPhotoBase64;
    }

    return false;
  }

  /**
   * Récupère toutes les photos d'une pièce (depuis les étapes)
   * Inclut les étapes de type 'photo_taken' ET les étapes 'button_click' avec images
   * Déduplique les étapes par etape_id (garde celle avec photo_url en priorité)
   */
  getPhotosForPiece(fusedData: FusedRapportData, pieceId: string): Etape[] {
    const etapes = this.getEtapesForPiece(fusedData, pieceId);
    const etapesAvecImages = etapes.filter(etape => this.hasImage(etape));

    // Dédupliquer par etape_id
    // Si plusieurs étapes ont le même etape_id, garder celle avec photo_url en priorité
    const uniqueEtapes = new Map<string, Etape>();

    etapesAvecImages.forEach(etape => {
      const existingEtape = uniqueEtapes.get(etape.etape_id);

      if (!existingEtape) {
        // Première occurrence de cet etape_id
        uniqueEtapes.set(etape.etape_id, etape);
      } else {
        // Doublon détecté : garder celle avec photo_url si disponible
        const currentHasUrl = !!(etape.photo_url && etape.photo_url.trim() !== '');
        const existingHasUrl = !!(existingEtape.photo_url && existingEtape.photo_url.trim() !== '');

        if (currentHasUrl && !existingHasUrl) {
          // L'étape actuelle a une URL mais pas l'existante, on la remplace
          uniqueEtapes.set(etape.etape_id, etape);
        }
        // Sinon on garde l'existante
      }
    });

    return Array.from(uniqueEtapes.values());
  }

  /**
   * Récupère les photos d'une étape spécifique
   * Inclut les étapes 'photo_taken' ET 'button_click' avec images
   */
  getPhotosForEtape(fusedData: FusedRapportData, pieceId: string, etapeId: string): Etape | null {
    const etapes = this.getEtapesForPiece(fusedData, pieceId);
    return etapes.find(etape => etape.etape_id === etapeId && this.hasImage(etape)) || null;
  }

  /**
   * Récupère les timestamps des actions d'une pièce
   */
  getTimestampsForPiece(fusedData: FusedRapportData, pieceId: string): {
    firstAction?: string;
    lastAction?: string;
    duration?: number;
  } {
    const etapes = this.getEtapesForPiece(fusedData, pieceId);
    
    if (etapes.length === 0) {
      return {};
    }

    const timestamps = etapes.map(e => new Date(e.timestamp).getTime()).sort();
    const firstTimestamp = timestamps[0];
    const lastTimestamp = timestamps[timestamps.length - 1];

    return {
      firstAction: new Date(firstTimestamp).toISOString(),
      lastAction: new Date(lastTimestamp).toISOString(),
      duration: Math.round((lastTimestamp - firstTimestamp) / 1000 / 60) // en minutes
    };
  }

  /**
   * Compte les photos validées vs non validées pour une pièce
   */
  getPhotoValidationStats(fusedData: FusedRapportData, pieceId: string): {
    total: number;
    validated: number;
    notValidated: number;
  } {
    const photos = this.getPhotosForPiece(fusedData, pieceId);
    
    const validated = photos.filter(p => p.validated === true).length;
    const total = photos.length;

    return {
      total,
      validated,
      notValidated: total - validated
    };
  }

  /**
   * Récupère les signalements par type
   */
  getSignalementsByType(fusedData: FusedRapportData, pieceId: string): Map<string, Signalement[]> {
    const signalements = this.getSignalementsForPiece(fusedData, pieceId);
    const byType = new Map<string, Signalement[]>();

    signalements.forEach(sig => {
      const type = sig.signalement_type || 'other';
      if (!byType.has(type)) {
        byType.set(type, []);
      }
      byType.get(type)!.push(sig);
    });

    return byType;
  }

  /**
   * Récupère les signalements utilisateur (directs) vs IA (photo_issue)
   */
  getSignalementsCategories(fusedData: FusedRapportData, pieceId: string): {
    userReports: Signalement[];
    aiDetected: Signalement[];
  } {
    const signalements = this.getSignalementsForPiece(fusedData, pieceId);

    return {
      userReports: signalements.filter(s => s.signalement_type === 'direct'),
      aiDetected: signalements.filter(s => s.signalement_type === 'photo_issue')
    };
  }
}

/**
 * Instance singleton du service de fusion
 */
export const dataFusionService = new DataFusionService();

