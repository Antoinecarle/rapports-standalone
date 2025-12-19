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
   *
   * IMPORTANT: L'application fonctionne même si l'endpoint rapportdata (AI) échoue.
   * Dans ce cas, des données par défaut sont générées à partir de fullData.
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

      // Charger toutes les données en parallèle avec Promise.allSettled
      // pour que l'échec d'un endpoint n'empêche pas les autres de se charger
      const results = await Promise.allSettled([
        aiDataService.fetchAiData(rapportId),
        myDataService.fetchMyData(rapportId),
        signalementsService.fetchSignalements(rapportId),
        fullDataService.fetchFullData(rapportId)
      ]);

      // Extraire les résultats
      const aiDataResult = results[0];
      const rawDataResult = results[1];
      const bubbleSignalementsResult = results[2];
      const fullDataResult = results[3];

      // fullData est OBLIGATOIRE - si elle échoue, on ne peut pas continuer
      if (fullDataResult.status === 'rejected') {
        console.error('[DataFusionService] ❌ Échec du chargement de fullData (CRITIQUE):', fullDataResult.reason);
        throw new Error(`Impossible de charger les données complètes du rapport: ${fullDataResult.reason}`);
      }

      const fullData = fullDataResult.value;
      console.log('[DataFusionService] ✅ fullData chargé avec succès');

      // rawData est OBLIGATOIRE
      if (rawDataResult.status === 'rejected') {
        console.error('[DataFusionService] ❌ Échec du chargement de rawData (CRITIQUE):', rawDataResult.reason);
        throw new Error(`Impossible de charger les données brutes du rapport: ${rawDataResult.reason}`);
      }

      const rawData = rawDataResult.value;
      console.log('[DataFusionService] ✅ rawData chargé avec succès');

      // bubbleSignalements est optionnel
      const bubbleSignalements = bubbleSignalementsResult.status === 'fulfilled'
        ? bubbleSignalementsResult.value
        : [];

      if (bubbleSignalementsResult.status === 'rejected') {
        console.warn('[DataFusionService] ⚠️ Échec du chargement des signalements Bubble (non critique):', bubbleSignalementsResult.reason);
      } else {
        console.log('[DataFusionService] ✅ bubbleSignalements chargé avec succès');
      }

      // aiData est optionnel - si elle échoue, on génère des données par défaut
      let aiData: RapportDataJSON;

      if (aiDataResult.status === 'rejected') {
        console.warn('[DataFusionService] ⚠️ Échec du chargement de aiData (non critique):', aiDataResult.reason);
        console.log('[DataFusionService] 🔄 Génération de données AI par défaut à partir de fullData...');
        aiData = this.createDefaultAiData(rapportId, fullData, rawData);
        console.log('[DataFusionService] ✅ Données AI par défaut générées avec succès');
      } else {
        aiData = aiDataResult.value;
        console.log('[DataFusionService] ✅ aiData chargé avec succès');
      }

      console.log('[DataFusionService] ✅ Toutes les données nécessaires ont été chargées');

      // Fusionner les données
      return this.fuseData(aiData, rawData, bubbleSignalements, fullData);
    } catch (error) {
      console.error('[DataFusionService] Erreur lors du chargement et de la fusion des données:', error);
      throw error;
    }
  }

  /**
   * Crée des données AI par défaut à partir de fullData et rawData
   * Utilisé quand l'endpoint rapportdata (AI) échoue
   */
  private createDefaultAiData(
    rapportId: string,
    fullData: FullDataResponse,
    rawData: MyDataJSON
  ): RapportDataJSON {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    // Créer les métadonnées du rapport
    const reportMetadata: RapportDataJSON['reportMetadata'] = {
      id: rapportId,
      logement: fullData.logementName || 'Logement',
      dateDebut: dateStr,
      dateFin: dateStr,
      statut: 'Terminé',
      parcours: rawData.parcours?.id || rapportId,
      typeParcours: 'voyageur',
      etatLieuxMoment: 'sortie',
      operateur: `${fullData.userfirstname || ''} ${fullData.userLastname || ''}`.trim() || 'Opérateur',
      etat: 1,
      dateGeneration: dateStr,
      heureGeneration: timeStr
    };

    // Créer la section synthèse
    const syntheseSection: RapportDataJSON['syntheseSection'] = {
      logement: fullData.logementName || 'Logement',
      voyageur: `${rawData.agent?.firstname || ''} ${rawData.agent?.lastname || ''}`.trim() || 'Voyageur',
      email: '',
      telephone: fullData.userPhone || rawData.agent?.phone || '',
      dateDebut: dateStr,
      dateFin: dateStr,
      heureCheckin: rawData.timestamps?.checkinStartHour || rawData.parcours?.start_time || '00:00:00',
      heureCheckout: rawData.timestamps?.checkoutStartHour || '00:00:00',
      heureCheckinFin: rawData.timestamps?.checkinEndHour || '00:00:00',
      heureCheckoutFin: rawData.timestamps?.checkoutEndHour || '00:00:00',
      noteGenerale: 8,
      sousNotes: {
        presenceObjets: 8,
        etatObjets: 8,
        proprete: 8,
        agencement: 8
      },
      statut: 'Terminé',
      remarquesGenerales: {
        objetsManquants: [],
        degradations: [],
        propreteAgencement: [],
        signalements: []
      }
    };

    // Créer la section remarques générales
    const remarquesGeneralesSection: RapportDataJSON['remarquesGeneralesSection'] = {
      scope: 'global',
      meta: {
        logementId: fullData.logementUniqueID || '',
        rapportId: rapportId,
        dateGeneration: dateStr,
        heureGeneration: timeStr,
        photosCheckin: rawData.checkin?.pieces?.reduce((sum, p) => sum + (p.etapes?.length || 0), 0) || 0,
        photosCheckout: fullData.photoPiececheckout?.length || 0
      },
      counts: {
        missing_item: 0,
        added_item: 0,
        positioning: 0,
        cleanliness: { high: 0, medium: 0, low: 0 },
        damage: { high: 0, medium: 0, low: 0 },
        image_quality: 0,
        wrong_room: 0
      },
      alerts: {
        wrong_room: false,
        image_quality: false,
        wrong_room_rooms: [],
        image_quality_rooms: []
      },
      highlights: [],
      user_reports: [],
      rooms: []
    };

    // Créer les détails par pièce à partir de fullData
    const detailParPieceSection: RapportDataJSON['detailParPieceSection'] = [];

    // Grouper les étapes par pièce
    const etapesByPiece = new Map<string, typeof fullData.etaperesponse>();
    fullData.etaperesponse?.forEach(etape => {
      if (!etapesByPiece.has(etape.pieceid)) {
        etapesByPiece.set(etape.pieceid, []);
      }
      etapesByPiece.get(etape.pieceid)!.push(etape);
    });

    // Grouper les photos de checkout par pièce
    const photosByPiece = new Map<string, string[]>();
    fullData.photoPiececheckout?.forEach(photo => {
      if (!photosByPiece.has(photo.pieceid)) {
        photosByPiece.set(photo.pieceid, []);
      }
      photosByPiece.get(photo.pieceid)!.push(photo.imagecheckout);
    });

    // Créer une pièce pour chaque pieceid trouvé
    const allPieceIds = new Set([
      ...etapesByPiece.keys(),
      ...photosByPiece.keys()
    ]);

    allPieceIds.forEach(pieceId => {
      const etapes = etapesByPiece.get(pieceId) || [];
      const photos = photosByPiece.get(pieceId) || [];

      // Trouver le nom de la pièce depuis rawData
      const rawPiece = rawData.checkin?.pieces?.find(p => p.piece_id === pieceId);
      const pieceName = rawPiece?.piece_name || `Pièce ${pieceId.substring(0, 8)}`;

      const pieceDetail: RapportDataJSON['detailParPieceSection'][0] = {
        id: pieceId,
        nom: pieceName,
        pieceIcon: '🏠',
        note: 8,
        resume: `État général satisfaisant`,
        photosReference: [],
        checkEntree: {
          estConforme: true,
          dateHeureValidation: rawData.timestamps?.checkin_start || dateStr,
          photosEntree: []
        },
        checkSortie: {
          estValide: true,
          dateHeureValidation: rawData.timestamps?.checkout_start || dateStr,
          photosSortie: photos,
          photosNonConformes: []
        },
        tachesValidees: etapes.map(etape => ({
          etapeId: etape.etapeid,
          nom: etape.title || 'Tâche',
          estApprouve: true,
          dateHeureValidation: dateStr,
          commentaire: etape.consigne || null,
          photo_url: etape.checkphoto || undefined,
          photo_reference_url: etape.referencephoto || undefined
        })),
        problemes: [],
        consignesIA: []
      };

      detailParPieceSection.push(pieceDetail);
    });

    // Créer la section check final à partir des exitQuestions
    const checkFinalSection: RapportDataJSON['checkFinalSection'] = (fullData.exitQuestion || []).map((q, index) => ({
      id: `exit-${index}`,
      text: q.question,
      completed: q.responseBoolean === 'oui',
      icon: q.responseBoolean === 'oui' ? '✓' : '✗',
      photo: q.imageresponseurl || undefined,
      responseText: q.responseText || undefined
    }));

    // Créer la section suggestions IA (vide par défaut)
    const suggestionsIASection: RapportDataJSON['suggestionsIASection'] = [];

    // Créer les labels UI (version française par défaut)
    const uiLabels: RapportDataJSON['uiLabels'] = {
      header: {
        title: 'Rapport d\'état des lieux',
        closeButton: 'Fermer'
      },
      syntheseSection: {
        title: 'Synthèse',
        voyageurTitle: 'Voyageur',
        checkEntreeTitle: 'Check d\'entrée',
        checkSortieTitle: 'Check de sortie',
        noteGeneraleTitle: 'Note générale',
        presenceObjetsLabel: 'Présence objets',
        etatObjetsLabel: 'État objets',
        propreteLabel: 'Propreté',
        agencementLabel: 'Agencement',
        debutLabel: 'Début',
        finLabel: 'Fin'
      },
      remarquesGeneralesSection: {
        title: 'Remarques générales',
        alerteTitle: 'Alertes',
        photosNonConformesLabel: 'Photos non conformes',
        qualiteInsuffisanteLabel: 'Qualité insuffisante',
        faitsSaillantsTitle: 'Faits saillants',
        signalementsUtilisateursTitle: 'Signalements utilisateurs',
        aTraiterLabel: 'À traiter',
        resoluLabel: 'Résolu'
      },
      detailParPieceSection: {
        title: 'Détail par pièce',
        photosReferenceLabel: 'Photos de référence',
        etatLieuxEntreeLabel: 'État des lieux d\'entrée',
        etatLieuxSortieLabel: 'État des lieux de sortie',
        conformeLabel: 'Conforme',
        nonConformeLabel: 'Non conforme',
        valideLabel: 'Validé',
        nonValideLabel: 'Non validé',
        tachesRealisees: 'Tâches réalisées',
        commentaireGlobalLabel: 'Commentaire global',
        faitsSignalesIATitle: 'Faits signalés par l\'IA',
        consignesIATitle: 'Consignes IA',
        aIgnorerLabel: 'À ignorer',
        aSurveillerLabel: 'À surveiller',
        ajouterButton: 'Ajouter',
        modifierButton: 'Modifier',
        supprimerButton: 'Supprimer',
        creerSignalementButton: 'Créer un signalement',
        ajouterConsigneIAButton: 'Ajouter une consigne IA',
        marquerCommeFauxButton: 'Marquer comme faux'
      },
      checkFinalSection: {
        title: 'Check final'
      },
      suggestionsIASection: {
        title: 'Suggestions IA'
      },
      badges: {
        tacheNonRealisee: 'Tâche non réalisée',
        faitSignale: 'Fait signalé',
        signalementCree: 'Signalement créé',
        consigneIAAjoutee: 'Consigne IA ajoutée',
        marqueCommeFaux: 'Marqué comme faux'
      },
      severite: {
        faible: 'Faible',
        moyenne: 'Moyenne',
        elevee: 'Élevée'
      },
      status: {
        ok: 'OK',
        attention: 'Attention',
        probleme: 'Problème',
        termine: 'Terminé',
        expire: 'Expiré',
        enCours: 'En cours'
      },
      typeParcours: {
        voyageur: 'Voyageur',
        menage: 'Ménage'
      },
      etatLieuxMoment: {
        sortie: 'Sortie',
        arriveeSortie: 'Arrivée/Sortie'
      }
    };

    return {
      reportMetadata,
      syntheseSection,
      remarquesGeneralesSection,
      detailParPieceSection,
      checkFinalSection,
      suggestionsIASection,
      uiLabels
    };
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
      piecesWithRawData,
      fullData  // Ajouter les données complètes depuis l'endpoint fulldata
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

