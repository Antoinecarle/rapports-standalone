import type { RapportDataJSON } from '@/types/rapport.types';
import type { MyDataJSON, Piece, Etape, Signalement, BubbleSignalement, BubbleConsigneIA } from '@/types/mydata.types';
import { signalementsService } from './signalementsService';
import { myDataService } from './mydataService';
import { aiDataService } from './aiDataService';
import { fullDataService, type FullDataResponse } from './fullDataService';
import { formatBubbleDateToTime } from '@/utils/dateUtils';

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
        // myDataService.fetchMyData(rapportId), // Désactivé - endpoint 404
        Promise.resolve(null), // Placeholder pour mydata
        signalementsService.fetchSignalementsResponse(rapportId), // Récupérer la réponse complète
        fullDataService.fetchFullData(rapportId)
      ]);

      // Extraire les résultats
      const aiDataResult = results[0];
      const rawDataResult = results[1];
      const bubbleSignalementsResponseResult = results[2];
      const fullDataResult = results[3];

      // fullData est OBLIGATOIRE - si elle échoue, on ne peut pas continuer
      if (fullDataResult.status === 'rejected') {
        console.error('[DataFusionService] ❌ Échec du chargement de fullData (CRITIQUE):', fullDataResult.reason);
        throw new Error(`Impossible de charger les données complètes du rapport: ${fullDataResult.reason}`);
      }

      const fullData = fullDataResult.value;
      console.log('[DataFusionService] ✅ fullData chargé avec succès');

      // rawData est optionnel - si elle échoue ou est null, on génère des données par défaut
      let rawData: MyDataJSON;

      if (rawDataResult.status === 'rejected' || rawDataResult.value === null) {
        if (rawDataResult.status === 'rejected') {
          console.warn('[DataFusionService] ⚠️ Échec du chargement de rawData (non critique):', rawDataResult.reason);
        } else {
          console.warn('[DataFusionService] ⚠️ rawData désactivé (endpoint mydata non disponible)');
        }
        console.log('[DataFusionService] 🔄 Génération de rawData par défaut...');
        rawData = this.createDefaultRawData(rapportId, fullData);
        console.log('[DataFusionService] ✅ rawData par défaut généré avec succès');
      } else {
        rawData = rawDataResult.value;
        console.log('[DataFusionService] ✅ rawData chargé avec succès');
      }

      // bubbleSignalements est optionnel
      const bubbleSignalementsResponse = bubbleSignalementsResponseResult.status === 'fulfilled'
        ? bubbleSignalementsResponseResult.value
        : { status: 'error', response: { signalement: [], consigneIA: [] } };

      const bubbleSignalements = bubbleSignalementsResponse.response.signalement;
      const bubbleConsignesIA = bubbleSignalementsResponse.response.consigneIA || [];

      if (bubbleSignalementsResponseResult.status === 'rejected') {
        console.warn('[DataFusionService] ⚠️ Échec du chargement des signalements Bubble (non critique):', bubbleSignalementsResponseResult.reason);
      } else {
        console.log('[DataFusionService] ✅ bubbleSignalements chargé avec succès:', bubbleSignalements.length, 'signalements,', bubbleConsignesIA.length, 'consignes IA');
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
      return this.fuseData(aiData, rawData, bubbleSignalements, bubbleConsignesIA, fullData);
    } catch (error) {
      console.error('[DataFusionService] Erreur lors du chargement et de la fusion des données:', error);
      throw error;
    }
  }

  /**
   * Crée des données rawData par défaut à partir de fullData
   * Utilisé quand l'endpoint mydata échoue
   */
  private createDefaultRawData(
    rapportId: string,
    fullData: FullDataResponse
  ): MyDataJSON {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    // Déterminer si c'est un parcours "sortie uniquement"
    const isSortieUniquement = fullData.rapportStep === 'checkOutOnly';

    return {
      webhook_version: '1.0',
      schema: 'default',
      checkID: rapportId,
      parcours_id: rapportId,
      logement_id: fullData.logementUniqueID || null,
      logement_name: fullData.logementName || null,
      agent: {
        id: 'default-agent',
        firstname: fullData.userfirstname || 'Prénom',
        lastname: fullData.userlastname || 'Nom',
        phone: fullData.userPhone || '',
        type: 'voyageur',
        type_label: 'Voyageur',
        verification_status: 'verified'
      },
      parcours: {
        id: rapportId,
        name: fullData.logementName || 'Parcours',
        type: 'checkout',
        start_time: timeStr,
        current_time: timeStr,
        duration_minutes: 0,
        completion_percentage: 100,
        total_pieces: fullData.etaperesponse?.length || 0,
        completed_pieces: fullData.etaperesponse?.length || 0,
        pieces_with_issues: 0
      },
      checkin: {
        pieces: [],
        stats: {
          total_pieces: 0,
          total_photos: 0,
          total_tasks: 0,
          completed_tasks: 0,
          completion_rate: 100
        },
        timestamp: dateStr,
        timestamps: {
          session_start: dateStr,
          snapshot_created: dateStr,
          checkin_completed: dateStr,
          exit_questions_completed: dateStr,
          // Ne pas définir les timestamps de checkin pour les parcours "sortie uniquement"
          checkinStartHour: isSortieUniquement ? null : timeStr,
          checkinEndHour: isSortieUniquement ? null : timeStr,
          checkoutStartHour: timeStr,
          checkoutEndHour: timeStr
        }
      },
      checkout: null,
      signalements: [],
      timestamps: {
        session_start: dateStr,
        snapshot_created: dateStr,
        checkin_completed: dateStr,
        exit_questions_completed: dateStr,
        // Ne pas définir les timestamps de checkin pour les parcours "sortie uniquement"
        checkinStartHour: isSortieUniquement ? null : timeStr,
        checkinEndHour: isSortieUniquement ? null : timeStr,
        checkoutStartHour: timeStr,
        checkoutEndHour: timeStr
      }
    };
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

    // Mapper rapportType de l'API vers typeParcours
    // API: "Ménage" ou "Voyageur" → App: "menage" ou "voyageur"
    const typeParcours: 'voyageur' | 'menage' =
      fullData.rapportType === 'Voyageur' ? 'voyageur' : 'menage';

    // Mapper rapportStep de l'API vers etatLieuxMoment
    // API: "checkOutOnly" ou "checkInAndCheckOut" → App: "sortie" ou "arrivee-sortie"
    const etatLieuxMoment: 'sortie' | 'arrivee-sortie' =
      fullData.rapportStep === 'checkInAndCheckOut' ? 'arrivee-sortie' : 'sortie';

    // Créer les métadonnées du rapport
    const reportMetadata: RapportDataJSON['reportMetadata'] = {
      id: rapportId,
      logement: fullData.logementName || 'Logement',
      dateDebut: dateStr,
      dateFin: dateStr,
      statut: 'Terminé',
      parcours: rawData.parcours?.id || rapportId,
      typeParcours,
      etatLieuxMoment,
      operateur: `${fullData.userfirstname || ''} ${fullData.userlastname || ''}`.trim() || 'Opérateur',
      etat: 1,
      dateGeneration: dateStr,
      heureGeneration: timeStr
    };

    // Créer la section synthèse
    const syntheseSection: RapportDataJSON['syntheseSection'] = {
      logement: fullData.logementName || 'Logement',
      voyageur: fullData.userfirstname && fullData.userlastname
        ? `${fullData.userfirstname} ${fullData.userlastname}`.trim()
        : `${rawData.agent?.firstname || ''} ${rawData.agent?.lastname || ''}`.trim() || 'Voyageur',
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

    // Grouper les photos de checkout par pièce avec leurs dates
    const photosByPiece = new Map<string, Array<{ url: string; datephoto?: string }>>();
    fullData.photoPiececheckout?.forEach(photo => {
      if (!photosByPiece.has(photo.pieceid)) {
        photosByPiece.set(photo.pieceid, []);
      }
      photosByPiece.get(photo.pieceid)!.push({
        url: photo.imagecheckout,
        datephoto: photo.datephoto
      });
    });

    // Créer une pièce pour chaque pieceid trouvé
    const allPieceIds = new Set([
      ...etapesByPiece.keys(),
      ...photosByPiece.keys()
    ]);

    allPieceIds.forEach(pieceId => {
      const etapes = etapesByPiece.get(pieceId) || [];
      const photos = photosByPiece.get(pieceId) || [];

      // Trouver le nom de la pièce depuis fullData
      let pieceName = `Pièce ${pieceId.substring(0, 8)}`;

      // Chercher d'abord dans le tableau piece (source principale)
      const pieceInfo = fullData.piece?.find(p => p.pieceid === pieceId);
      if (pieceInfo?.nom) {
        pieceName = pieceInfo.nom;
        console.log(`[DataFusionService] 📝 Nom de pièce trouvé dans fullData.piece: ${pieceName} pour ${pieceId}`);
      } else {
        // Sinon chercher dans etaperesponse avec le champ nom
        const etapeWithName = fullData.etaperesponse?.find(e => e.pieceid === pieceId && e.nom);
        if (etapeWithName?.nom) {
          pieceName = etapeWithName.nom;
          console.log(`[DataFusionService] 📝 Nom de pièce trouvé dans etaperesponse.nom: ${pieceName} pour ${pieceId}`);
        } else {
          // Sinon chercher dans photoPiececheckout avec le champ nom
          const photoWithName = fullData.photoPiececheckout?.find(p => p.pieceid === pieceId && p.nom);
          if (photoWithName?.nom) {
            pieceName = photoWithName.nom;
            console.log(`[DataFusionService] 📝 Nom de pièce trouvé dans photoPiececheckout.nom: ${pieceName} pour ${pieceId}`);
          } else {
            // En dernier recours, chercher dans rawData
            const rawPiece = rawData.checkin?.pieces?.find(p => p.piece_id === pieceId);
            if (rawPiece?.nom) {
              pieceName = rawPiece.nom;
              console.log(`[DataFusionService] 📝 Nom de pièce trouvé dans rawData: ${pieceName} pour ${pieceId}`);
            } else {
              console.warn(`[DataFusionService] ⚠️ Aucun nom de pièce trouvé pour ${pieceId}`);
              console.warn(`[DataFusionService] ⚠️ Utilisation du nom par défaut: ${pieceName}`);
            }
          }
        }
      }

      const pieceDetail: RapportDataJSON['detailParPieceSection'][0] = {
        id: pieceId,
        nom: pieceName,
        pieceIcon: '🏠',
        note: 8,
        resume: `État général satisfaisant`,
        photosReference: [],
        checkEntree: {
          estConforme: true,
          dateHeureValidation: rawData.timestamps?.checkinStartHour || dateStr,
          photosEntree: []
        },
        checkSortie: {
          estValide: true,
          dateHeureValidation: rawData.timestamps?.checkoutStartHour || dateStr,
          photosSortie: photos,
          photosNonConformes: []
        },
        tachesValidees: etapes.map(etape => ({
          etapeId: etape.etapeid,
          nom: etape.title || 'Tâche',
          estApprouve: etape.isdone === 'oui', // Mapper isdone depuis l'API : "oui" = true, "non" = false
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
    bubbleConsignesIA: BubbleConsigneIA[],
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

    // Créer un mapping des consignes IA par Piece
    const consignesByPiece = new Map<string, BubbleConsigneIA[]>();

    // Récupérer le parcours_ref depuis le premier signalement (ils ont tous le même parcours)
    const parcoursRef = bubbleSignalements.length > 0 ? bubbleSignalements[0].parcours_ref : null;

    // Grouper les consignes IA par pièce
    bubbleConsignesIA.forEach((consigne: BubbleConsigneIA) => {
      // Filtrer par parcours si disponible
      if (!parcoursRef || consigne.parcourRef === parcoursRef) {
        const pieceId = consigne.Piece;
        if (pieceId) {
          if (!consignesByPiece.has(pieceId)) {
            consignesByPiece.set(pieceId, []);
          }
          consignesByPiece.get(pieceId)!.push(consigne);
        }
      }
    });

    // Créer le mapping des pièces avec leurs données brutes
    const piecesWithRawData = new Map();

    aiData.detailParPieceSection.forEach(aiPiece => {
      const rawPiece = rawPiecesMap.get(aiPiece.id);
      const signalements = signalementsByRoom.get(aiPiece.id) || [];
      const consignes = consignesByPiece.get(aiPiece.id) || [];

      // Récupérer le nom de la pièce depuis Bubble (fullData.piece)
      let pieceName = aiPiece.nom; // Fallback sur le nom IA
      const pieceFromBubble = fullData.piece?.find(p => p.pieceid === aiPiece.id);
      if (pieceFromBubble?.nom) {
        pieceName = pieceFromBubble.nom;
        console.log(`[DataFusionService] 📝 Nom de pièce remplacé par Bubble: ${pieceName} pour ${aiPiece.id}`);
      }

      // Récupérer les photos de référence depuis fullData.photoPieceinitiales
      let photosReference = aiPiece.photosReference || [];
      const photosInitialesForPiece = fullData.photoPieceinitiales?.find(p => p.pieceid === aiPiece.id);
      if (photosInitialesForPiece?.photourl && photosInitialesForPiece.photourl.length > 0) {
        photosReference = photosInitialesForPiece.photourl.filter(url => url && url.trim() !== '');
        console.log(`[DataFusionService] 📸 ${photosReference.length} photo(s) de référence trouvée(s) pour ${pieceName}`);
      }

      // Créer une copie de aiPiece avec le nom et les photos de référence mis à jour
      const aiPieceWithBubbleName = {
        ...aiPiece,
        nom: pieceName,
        photosReference: photosReference
      };

      piecesWithRawData.set(aiPiece.id, {
        aiData: aiPieceWithBubbleName,
        rawPiece: rawPiece || null,
        etapes: rawPiece?.etapes || [],
        signalements: signalements,
        consignesIA: consignes
      });
    });

    // Mapper rapportType et rapportStep depuis fullData vers reportMetadata
    // API: "Ménage" ou "Voyageur" → App: "menage" ou "voyageur"
    const typeParcours: 'voyageur' | 'menage' =
      fullData.rapportType === 'Voyageur' ? 'voyageur' : 'menage';

    // API: "checkOutOnly" ou "checkInAndCheckOut" → App: "sortie" ou "arrivee-sortie"
    const etatLieuxMoment: 'sortie' | 'arrivee-sortie' =
      fullData.rapportStep === 'checkInAndCheckOut' ? 'arrivee-sortie' : 'sortie';

    // Mapper les timestamps depuis fullData (format Bubble) vers rawData.timestamps (format HH:mm)
    // Les timestamps de fullData sont au format "Nov 26, 2025 11:22 am"
    // On les convertit en format HH:mm pour l'affichage
    // Pour les parcours "sortie uniquement", ne pas utiliser les timestamps de checkin
    const isSortieUniquement = etatLieuxMoment === 'sortie';
    const updatedTimestamps = {
      ...rawData.timestamps,
      // Ne mapper les timestamps de checkin que si ce n'est PAS un parcours "sortie uniquement"
      checkinStartHour: !isSortieUniquement
        ? (formatBubbleDateToTime(fullData.checkinstarttime) || rawData.timestamps?.checkinStartHour)
        : null,
      checkinEndHour: !isSortieUniquement
        ? (formatBubbleDateToTime(fullData.checkinendtime) || rawData.timestamps?.checkinEndHour)
        : null,
      checkoutStartHour: formatBubbleDateToTime(fullData.checkoutstarttime) || rawData.timestamps?.checkoutStartHour,
      checkoutEndHour: formatBubbleDateToTime(fullData.checkoutendtime) || rawData.timestamps?.checkoutEndHour
    };

    // Mettre à jour detailParPieceSection avec les noms de Bubble
    const detailParPieceSectionWithBubbleNames = aiData.detailParPieceSection.map(piece => {
      const pieceFromBubble = fullData.piece?.find(p => p.pieceid === piece.id);
      if (pieceFromBubble?.nom) {
        return {
          ...piece,
          nom: pieceFromBubble.nom
        };
      }
      return piece;
    });

    // Extraire le global_score depuis dataia si disponible
    const globalScore = fullData.dataia?.analysis_enrichment?.global_score;
    console.log('[DataFusionService] 🎯 global_score extrait:', globalScore);

    // Retourner les données fusionnées avec reportMetadata et timestamps mis à jour
    return {
      ...aiData,
      detailParPieceSection: detailParPieceSectionWithBubbleNames,
      reportMetadata: {
        ...aiData.reportMetadata,
        typeParcours,
        etatLieuxMoment,
        logementName: fullData.logementName,  // 🆕 Nom du logement
        global_score: globalScore  // 🆕 Score global avec explication
      },
      rawData: {
        agent: rawData.agent,
        parcours: rawData.parcours,
        checkin: rawData.checkin,
        signalements: enrichedSignalements,
        timestamps: updatedTimestamps,
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

