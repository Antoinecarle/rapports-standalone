import type { RapportDataJSON } from '@/types/rapport.types';
import type { FusedRapportData } from './dataFusionService';
import { dataFusionService } from './dataFusionService';

/**
 * Fonctions de mapping pour transformer les données fusionnées
 * (data.json + mydata.json) vers les structures attendues par les composants React
 */

/**
 * Mappe les métadonnées du rapport pour App.tsx
 * Enrichi avec les données brutes du parcours
 */
export function mapToAppRapport(data: FusedRapportData) {
  const { reportMetadata, syntheseSection, rawData } = data;

  return {
    id: reportMetadata.id,
    logement: reportMetadata.logement,
    dateDebut: reportMetadata.dateDebut || syntheseSection.dateDebut,
    dateFin: reportMetadata.dateFin || syntheseSection.dateFin,
    statut: reportMetadata.statut,
    parcours: reportMetadata.parcours,
    typeParcours: reportMetadata.typeParcours,
    etatLieuxMoment: reportMetadata.etatLieuxMoment === 'sortie' ? 'sortie' : 'arrivee-sortie',
    operateur: reportMetadata.operateur,
    etat: reportMetadata.etat,
    // Calculer le nombre de signalements depuis les données brutes
    signalements: rawData.signalements?.length || 0,
    // Score de confiance basé sur la note générale (convertir 1-5 en pourcentage)
    scoreConfiance: Math.round((syntheseSection.noteGenerale / 5) * 100),
    // Informations supplémentaires du parcours
    parcoursInfo: {
      startTime: rawData.parcours.start_time,
      currentTime: rawData.parcours.current_time,
      durationMinutes: rawData.parcours.duration_minutes,
      completionPercentage: rawData.parcours.completion_percentage,
      totalPieces: rawData.parcours.total_pieces,
      completedPieces: rawData.parcours.completed_pieces,
      piecesWithIssues: rawData.parcours.pieces_with_issues
    },
    // Informations de l'agent
    agentInfo: {
      id: rawData.agent.id,
      firstname: rawData.agent.firstname,
      lastname: rawData.agent.lastname,
      phone: rawData.agent.phone,
      type: rawData.agent.type,
      typeLabel: rawData.agent.type_label,
      verificationStatus: rawData.agent.verification_status
    }
  };
}

/**
 * Formate un timestamp ISO en heure HH:mm
 */
function formatTimestampToHour(timestamp: string | null | undefined): string | undefined {
  if (!timestamp) return undefined;

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return undefined;

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return undefined;
  }
}

/**
 * Mappe les données de synthèse pour RapportSynthese
 * Enrichi avec les informations de l'agent et les timestamps du parcours
 * Utilise les données de rawData comme fallback quand syntheseSection est vide
 */
export function mapToRapportSynthese(data: FusedRapportData) {
  const { syntheseSection, rawData } = data;

  // Récupérer les timestamps depuis rawData (au niveau racine, pas dans checkin)
  const timestamps = rawData.timestamps || {};

  // Formater les timestamps
  const checkinStartHour = formatTimestampToHour(timestamps.checkinStartHour);
  const checkinEndHour = formatTimestampToHour(timestamps.checkinEndHour);
  const checkoutStartHour = formatTimestampToHour(timestamps.checkoutStartHour);
  const checkoutEndHour = formatTimestampToHour(timestamps.checkoutEndHour);

  // Fallback sur les données agent si syntheseSection est vide ou contient des valeurs par défaut
  const voyageur = syntheseSection.voyageur &&
                   syntheseSection.voyageur !== "Non renseigné" &&
                   syntheseSection.voyageur.trim() !== ""
    ? syntheseSection.voyageur
    : `${rawData.agent.firstname} ${rawData.agent.lastname}`;

  const telephone = syntheseSection.telephone && syntheseSection.telephone.trim() !== ""
    ? syntheseSection.telephone
    : rawData.agent.phone;

  // Fallback sur les timestamps du parcours pour les dates si syntheseSection est vide
  const dateDebut = syntheseSection.dateDebut && syntheseSection.dateDebut.trim() !== ""
    ? syntheseSection.dateDebut
    : (timestamps.session_start
        ? new Date(timestamps.session_start).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : '');

  const dateFin = syntheseSection.dateFin && syntheseSection.dateFin.trim() !== ""
    ? syntheseSection.dateFin
    : (timestamps.checkin_completed
        ? new Date(timestamps.checkin_completed).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : '');

  // Gérer l'adresse du logement
  const logement = syntheseSection.logement &&
                   syntheseSection.logement !== "Adresse non renseignée" &&
                   syntheseSection.logement.trim() !== ""
    ? syntheseSection.logement
    : "Logement non renseigné";

  return {
    logement,
    voyageur,
    email: syntheseSection.email,
    telephone,
    dateDebut,
    dateFin,
    heureCheckin: syntheseSection.heureCheckin,
    heureCheckout: syntheseSection.heureCheckout || syntheseSection.heureCheckoutFin,
    noteGenerale: syntheseSection.noteGenerale,
    sousNotes: syntheseSection.sousNotes,
    statut: syntheseSection.statut,
    remarquesGenerales: syntheseSection.remarquesGenerales,
    // Informations supplémentaires de l'agent
    agentFullName: `${rawData.agent.firstname} ${rawData.agent.lastname}`,
    agentPhone: rawData.agent.phone,
    agentType: rawData.agent.type_label,
    // Timestamps du parcours (formatés en HH:mm)
    checkinStartHour,
    checkinEndHour,
    checkoutStartHour,
    checkoutEndHour
  };
}

/**
 * Mappe les remarques générales pour RemarquesGenerales
 * Enrichi avec les signalements utilisateurs depuis mydata.json
 */
export function mapToRemarquesGenerales(data: FusedRapportData) {
  const remarques = { ...data.remarquesGeneralesSection };

  // Créer un mapping des IDs de pièces vers leurs noms
  const pieceIdToName = new Map<string, string>();
  data.detailParPieceSection.forEach(piece => {
    pieceIdToName.set(piece.id, piece.nom);
  });

  // Ajouter les signalements utilisateurs directs depuis rawData
  const userSignalements = data.rawData.signalements
    .filter(s => s.signalement_type === 'direct')
    .map(s => ({
      text: s.description || s.titre, // Description d'abord (le texte du signalement), puis titre (le type)
      status: s.status === 'open' ? 'confirmé' : 'non_verifiable',
      room: s.room_id,
      roomName: pieceIdToName.get(s.room_id) || s.room_id, // Résoudre le nom de la pièce
      // Données enrichies depuis l'API Bubble
      typeText: s.typeText,
      img_url: s.img_url,
      signaleur: s.signaleur,
      created_at: s.created_at,
      updated_at: s.updated_at,
      OS_signalementStatut: s.status
    }));

  remarques.user_reports = [...remarques.user_reports, ...userSignalements];

  return remarques;
}

/**
 * Mappe les détails des pièces pour RapportPieceDetail
 * Enrichi avec les données brutes (étapes, photos, signalements, timestamps)
 */
export function mapToPiecesDetails(data: FusedRapportData) {
  return data.detailParPieceSection.map(piece => {
    // Récupérer les données brutes de la pièce
    const pieceData = data.piecesWithRawData.get(piece.id);
    const etapes = pieceData?.etapes || [];
    const signalements = pieceData?.signalements || [];

    // Calculer les timestamps
    const timestamps = dataFusionService.getTimestampsForPiece(data, piece.id);

    // Statistiques de validation des photos
    const photoStats = dataFusionService.getPhotoValidationStats(data, piece.id);

    // Récupérer toutes les photos
    const photos = dataFusionService.getPhotosForPiece(data, piece.id);

    // Catégoriser les signalements
    const signalementsCategories = dataFusionService.getSignalementsCategories(data, piece.id);

    // Utiliser les photos de sortie depuis fulldata si disponibles
    let photosSortieCapturees: string[] = [];
    if (data.fullData?.photoPiececheckout) {
      // Filtrer les photos pour cette pièce depuis fulldata
      photosSortieCapturees = data.fullData.photoPiececheckout
        .filter(photo => photo.pieceid === piece.id)
        .map(photo => photo.imagecheckout)
        .filter(url => url && url.trim() !== '');
    }

    // Fallback : utiliser mydata.json si fulldata n'a pas de photos pour cette pièce
    if (photosSortieCapturees.length === 0) {
      photosSortieCapturees = photos
        .filter(photo => photo.etape_type === 'checkout')
        .map(photo => photo.photo_url || photo.photo_base64)
        .filter(url => url && url.trim() !== '');
    }

    // Extraire les photos d'entrée (checkin)
    const photosEntreeCapturees = photos
      .filter(photo => photo.etape_type === 'checkin')
      .map(photo => photo.photo_url || photo.photo_base64)
      .filter(url => url && url.trim() !== ''); // Filtrer les URLs vides ou nulles

    // Créer un mapping des tâches avec leurs photos
    // Priorité 1 : Utiliser fulldata.etaperesponse si disponible
    // Priorité 2 : Fallback sur mydata.json
    const tachesAvecPhotos = (piece.tachesValidees || []).map(tache => {
      let photoUrl: string | undefined = undefined;
      let photoReferenceUrl: string | undefined = undefined;

      // Chercher d'abord dans fulldata.etaperesponse
      // Matcher par nom de tâche car les etapeId ne correspondent pas entre data.json et fulldata
      if (data.fullData?.etaperesponse) {
        const etapeFromFullData = data.fullData.etaperesponse.find(
          etape => etape.title === tache.nom && etape.pieceid === piece.id
        );

        if (etapeFromFullData) {
          // Photo de vérification (checkphoto)
          if (etapeFromFullData.checkphoto) {
            photoUrl = etapeFromFullData.checkphoto;
          }
          // Photo de référence (referencephoto)
          if (etapeFromFullData.referencephoto) {
            photoReferenceUrl = etapeFromFullData.referencephoto;
          }
        }
      }

      // Fallback : chercher dans mydata.json si pas trouvé dans fulldata
      if (!photoUrl) {
        let tachePhoto = null;

        if (tache.etapeId) {
          // Chercher par etapeId
          tachePhoto = etapes.find(etape => {
            if (etape.etape_id !== tache.etapeId) return false;
            const hasPhoto = (etape.photo_url && etape.photo_url.trim() !== '') ||
                            (etape.photo_base64 && etape.photo_base64.trim() !== '');
            return hasPhoto;
          });
        } else {
          // Chercher par todo_title
          tachePhoto = etapes.find(etape => {
            const hasMatchingTodo = etape.is_todo === true && etape.todo_title === tache.nom;
            if (!hasMatchingTodo) return false;
            const hasPhoto = etape.photo_url || etape.photo_base64;
            return hasPhoto;
          });
        }

        photoUrl = tachePhoto?.photo_url || tachePhoto?.photo_base64;
      }

      return {
        ...tache,
        photo_url: photoUrl,
        photo_reference_url: photoReferenceUrl
      };
    });

    return {
      id: piece.id,
      nom: piece.nom,
      pieceIcon: piece.pieceIcon,
      note: piece.note,
      resume: piece.resume,
      photosReference: piece.photosReference || [],
      checkEntree: piece.checkEntree ? {
        estConforme: piece.checkEntree.estConforme,
        dateHeureValidation: piece.checkEntree.dateHeureValidation,
        photosReprises: piece.checkEntree.photosReprises || [],
        // Ajouter les photos d'entrée capturées
        photosEntree: photosEntreeCapturees.length > 0 ? photosEntreeCapturees : undefined
      } : undefined,
      checkSortie: piece.checkSortie ? {
        estValide: piece.checkSortie.estValide,
        dateHeureValidation: piece.checkSortie.dateHeureValidation,
        // Utiliser les photos capturées depuis mydata.json au lieu de data.json
        photosSortie: photosSortieCapturees.length > 0 ? photosSortieCapturees : (piece.checkSortie.photosSortie || []),
        photosNonConformes: piece.checkSortie.photosNonConformes || []
      } : undefined,
      tachesValidees: tachesAvecPhotos,
      problemes: piece.problemes.map(probleme => ({
        id: probleme.id,
        titre: probleme.titre,
        description: probleme.description,
        severite: probleme.severite,
        detectionIA: probleme.detectionIA,
        consignesIA: probleme.consignesIA || [],
        estFaux: probleme.estFaux || false
      })),
      consignesIA: piece.consignesIA || [],
      // Données brutes enrichies
      rawData: {
        etapes: etapes,
        photos: photos,
        signalements: signalements,
        signalementsUtilisateur: signalementsCategories.userReports,
        signalementsIA: signalementsCategories.aiDetected,
        timestamps: timestamps,
        photoStats: photoStats,
        totalEtapes: etapes.length,
        totalPhotos: photos.length,
        totalSignalements: signalements.length
      }
    };
  });
}

/**
 * Mappe les suggestions IA pour RapportSuggestions
 */
export function mapToSuggestions(data: FusedRapportData) {
  return data.suggestionsIASection.map(suggestion => ({
    titre: suggestion.titre,
    description: suggestion.description,
    priorite: suggestion.priorite
  }));
}

/**
 * Mappe le check final pour RapportCheckFinal
 * Utilise fulldata.exitQuestion si disponible, sinon fallback sur checkFinalSection
 */
export function mapToCheckFinal(data: FusedRapportData) {
  // Priorité 1 : Utiliser fulldata.exitQuestion si disponible
  if (data.fullData?.exitQuestion && data.fullData.exitQuestion.length > 0) {
    return data.fullData.exitQuestion.map((question, index) => {
      // Déterminer si la question est complétée
      let completed = false;
      if (question.questionType === 'boolean') {
        completed = question.responseBoolean === 'oui';
      } else if (question.questionType === 'text') {
        completed = !!(question.responseText && question.responseText.trim() !== '');
      }

      // Extraire l'emoji de la question (premier caractère si c'est un emoji)
      const emojiMatch = question.question.match(/^([\u{1F300}-\u{1F9FF}])/u);
      const icon = emojiMatch ? emojiMatch[1] : 'shield';

      return {
        id: `exit-question-${index}`,
        text: question.question,
        completed,
        icon,
        photo: question.imageresponseurl || undefined
      };
    });
  }

  // Priorité 2 : Fallback sur checkFinalSection
  if (!data.checkFinalSection || data.checkFinalSection.length === 0) {
    return [];
  }

  return data.checkFinalSection.map((item, index) => ({
    id: item.id || `check-${index}`,
    text: item.text,
    completed: item.completed,
    icon: item.icon || 'shield'
  }));
}

/**
 * Fonction principale qui mappe toutes les données fusionnées
 * Retourne un objet avec toutes les données transformées et enrichies
 */
export function mapRapportData(data: FusedRapportData) {
  return {
    rapport: mapToAppRapport(data),
    synthese: mapToRapportSynthese(data),
    remarquesGenerales: mapToRemarquesGenerales(data),
    pieces: mapToPiecesDetails(data),
    suggestions: mapToSuggestions(data),
    checkFinal: mapToCheckFinal(data),
    uiLabels: data.uiLabels,
    // Données brutes globales pour accès direct si nécessaire
    rawGlobalData: {
      agent: data.rawData.agent,
      parcours: data.rawData.parcours,
      checkinStats: data.rawData.checkin.stats,
      totalSignalements: data.rawData.signalements.length,
      signalementsByType: data.rawData.signalements.reduce((acc, sig) => {
        const type = sig.signalement_type || 'other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    }
  };
}

/**
 * Type pour les données mappées
 */
export type MappedRapportData = ReturnType<typeof mapRapportData>;

