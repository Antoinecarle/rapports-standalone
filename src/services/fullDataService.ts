/**
 * Service pour récupérer les données complètes du rapport depuis l'endpoint fulldata
 * Cet endpoint fournit :
 * - Les photos d'état des lieux (checkout)
 * - Les étapes validées avec leurs photos
 * - Les questions de sortie
 */

import { apiConfig } from '@/config/api.config';

export interface PhotoPieceCheckout {
  pieceid: string;
  nom?: string;  // Nom de la pièce depuis Bubble.io
  imagecheckout: string;
  datephoto?: string;  // Date de la photo au format "Dec 2, 2025 8:34 pm"
}

export interface PhotoPieceInitiale {
  pieceid: string;
  nom: string;
  photourl: string[];  // Tableau d'URLs de photos initiales
}

export interface EtapeResponse {
  pieceid: string;
  nom?: string;  // Nom de la pièce depuis Bubble.io
  etapeid: string;
  referencephoto: string;
  checkphoto: string;
  title: string;
  consigne: string;
  isdone: 'oui' | 'non';  // Statut de complétion de l'étape
}

export interface ExitQuestion {
  question: string;
  responseText: string;
  responseBoolean: string;
  imageresponseurl: string;
  questionType: 'boolean' | 'text';
}

export interface Piece {
  pieceid: string;
  nom: string;
}

export interface DataIA {
  // Structure des données d'analyse IA depuis Bubble.io
  // À compléter selon la structure réelle une fois qu'elle sera définie
  [key: string]: any;
}

export interface FullDataResponse {
  rapportID: string;
  userfirstname?: string;
  userlastname?: string;  // Tout en minuscules comme dans l'API Bubble
  userPhone?: string;
  logementName?: string;
  logementAdress?: string;
  logementUniqueID?: string;
  conciergerieName?: string;
  rapportType?: string;  // "Ménage" ou "Voyageur"
  rapportStep?: string;  // "checkOutOnly" ou "checkInAndCheckOut"
  checkinstarttime?: string;  // Format: "Nov 26, 2025 11:22 am"
  checkinendtime?: string;    // Format: "Nov 26, 2025 11:22 am"
  checkoutstarttime?: string; // Format: "Nov 26, 2025 11:22 am"
  checkoutendtime?: string;   // Format: "Nov 26, 2025 11:23 am"
  photoPieceinitiales?: PhotoPieceInitiale[];  // Photos d'entrée/checkin par pièce
  photoPiececheckout: PhotoPieceCheckout[];
  etaperesponse: EtapeResponse[];
  exitQuestion: ExitQuestion[];
  piece?: Piece[];  // Liste des pièces avec leurs noms
  dataia?: DataIA;  // Données d'analyse IA depuis Bubble.io
}

class FullDataService {
  /**
   * Récupère les données complètes du rapport depuis l'API
   */
  async fetchFullData(rapportId: string): Promise<FullDataResponse> {
    try {
      console.log(`[FullDataService] Chargement des données complètes pour le rapport: ${rapportId}`);

      const url = apiConfig.buildUrl('rapportfulldata', { rapport: rapportId });
      console.log(`[FullDataService] URL: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      // Récupérer le texte brut et nettoyer les caractères de contrôle invalides
      const rawText = await response.text();

      // Remplacer les retours à la ligne dans les chaînes JSON par des espaces
      let cleanedText = rawText.replace(/\r?\n/g, ' ');

      // WORKAROUND: Corriger les erreurs de formatage JSON de l'API Bubble
      // Problème 1: userPhone" au lieu de "userPhone" (manque le guillemet d'ouverture)
      if (cleanedText.includes('userPhone"')) {
        console.warn('[FullDataService] ⚠️ Correction JSON appliquée: userPhone" -> "userPhone"');
        cleanedText = cleanedText.replace(/([,\s])userPhone"/g, '$1"userPhone"');
      }

      // Problème 2: Clés dupliquées "logementName" - extraire la première valeur avant parsing
      // L'API retourne plusieurs fois "logementName" : "" qui écrasent la première valeur valide
      let firstLogementName: string | null = null;
      const logementNameMatch = cleanedText.match(/"logementName"\s*:\s*"([^"]*)"/);
      if (logementNameMatch) {
        firstLogementName = logementNameMatch[1];
        if (firstLogementName) {
          console.warn('[FullDataService] ⚠️ Première valeur de logementName extraite:', firstLogementName);
        }
      }

      // Problème 3: JSON malformé pour le champ dataia
      // L'API retourne ],"dataia" : } au lieu de ],"dataia" : {} }
      if (cleanedText.match(/\],"dataia"\s*:\s*\}$/)) {
        console.warn('[FullDataService] ⚠️ Correction JSON appliquée: dataia malformé');
        cleanedText = cleanedText.replace(/\],"dataia"\s*:\s*\}$/, '], "dataia" : {} }');
      }

      // Parser le JSON nettoyé
      const data = JSON.parse(cleanedText);

      // Restaurer la première valeur de logementName si elle a été écrasée
      if (firstLogementName && (!data.logementName || data.logementName.trim() === '')) {
        data.logementName = firstLogementName;
        console.warn('[FullDataService] ⚠️ Valeur de logementName restaurée:', firstLogementName);
      }

      // Corriger les URLs qui commencent par // au lieu de https://
      // et nettoyer les virgules et espaces en fin d'URL
      if (data.etaperesponse) {
        data.etaperesponse = data.etaperesponse.map((etape: EtapeResponse) => {
          let referencephoto = etape.referencephoto?.trim().replace(/,+\s*$/, '');
          let checkphoto = etape.checkphoto?.trim().replace(/,+\s*$/, '');

          if (referencephoto?.startsWith('//')) {
            referencephoto = `https:${referencephoto}`;
          }
          if (checkphoto?.startsWith('//')) {
            checkphoto = `https:${checkphoto}`;
          }

          return {
            ...etape,
            referencephoto,
            checkphoto
          };
        });
      }

      console.log('[FullDataService] Données complètes chargées avec succès');
      console.log(`- Photos checkout: ${data.photoPiececheckout?.length || 0}`);
      console.log(`- Étapes validées: ${data.etaperesponse?.length || 0}`);
      console.log(`- Questions de sortie: ${data.exitQuestion?.length || 0}`);

      return data;
    } catch (error) {
      console.error('[FullDataService] Erreur lors du chargement des données complètes:', error);
      throw error;
    }
  }

  /**
   * Groupe les photos de checkout par pièce
   */
  groupPhotosByPiece(photos: PhotoPieceCheckout[]): Map<string, string[]> {
    const grouped = new Map<string, string[]>();

    photos.forEach(photo => {
      const existing = grouped.get(photo.pieceid) || [];
      existing.push(photo.imagecheckout);
      grouped.set(photo.pieceid, existing);
    });

    return grouped;
  }

  /**
   * Groupe les étapes par pièce
   */
  groupEtapesByPiece(etapes: EtapeResponse[]): Map<string, EtapeResponse[]> {
    const grouped = new Map<string, EtapeResponse[]>();

    etapes.forEach(etape => {
      const existing = grouped.get(etape.pieceid) || [];
      existing.push(etape);
      grouped.set(etape.pieceid, existing);
    });

    return grouped;
  }
}

export const fullDataService = new FullDataService();

