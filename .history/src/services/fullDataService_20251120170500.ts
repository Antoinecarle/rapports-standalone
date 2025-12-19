/**
 * Service pour récupérer les données complètes du rapport depuis l'endpoint fulldata
 * Cet endpoint fournit :
 * - Les photos d'état des lieux (checkout)
 * - Les étapes validées avec leurs photos
 * - Les questions de sortie
 */

const API_BASE_URL = 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf';

export interface PhotoPieceCheckout {
  pieceid: string;
  imagecheckout: string;
}

export interface EtapeResponse {
  pieceid: string;
  etapeid: string;
  referencephoto: string;
  checkphoto: string;
  title: string;
  consigne: string;
}

export interface ExitQuestion {
  question: string;
  responseText: string;
  responseBoolean: string;
  imageresponseurl: string;
  questionType: 'boolean' | 'text';
}

export interface FullDataResponse {
  rapportID: string;
  photoPiececheckout: PhotoPieceCheckout[];
  etaperesponse: EtapeResponse[];
  exitQuestion: ExitQuestion[];
}

class FullDataService {
  /**
   * Récupère les données complètes du rapport depuis l'API
   */
  async fetchFullData(rapportId: string): Promise<FullDataResponse> {
    try {
      console.log(`[FullDataService] Chargement des données complètes pour le rapport: ${rapportId}`);

      const url = `${API_BASE_URL}/rapportfulldata?rapport=${rapportId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      // Récupérer le texte brut et nettoyer les caractères de contrôle invalides
      const rawText = await response.text();

      // Remplacer les retours à la ligne dans les chaînes JSON par des espaces
      const cleanedText = rawText.replace(/\r?\n/g, ' ');

      // Parser le JSON nettoyé
      const data = JSON.parse(cleanedText);

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

