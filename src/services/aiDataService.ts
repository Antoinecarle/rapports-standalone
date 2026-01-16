import type { RapportDataJSON } from '@/types/rapport.types';
import { apiConfig } from '@/config/api.config';

/**
 * Service pour charger les données d'analyse IA depuis l'API Bubble
 */
class AiDataService {
  private readonly ENDPOINT = 'rapportdataia';

  /**
   * Récupère les données d'analyse IA depuis l'API
   * @param rapportId - ID du rapport à charger
   * @returns Les données d'analyse IA au format RapportDataJSON
   * @throws Error si l'appel API échoue
   */
  async fetchAiData(rapportId: string): Promise<RapportDataJSON> {
    if (!rapportId || rapportId.trim() === '') {
      throw new Error('L\'ID du rapport est requis pour charger les données d\'analyse IA');
    }

    const url = apiConfig.buildUrl(this.ENDPOINT, { rapport: rapportId });

    console.log(`[AiDataService] Chargement des données d'analyse IA depuis l'API pour le rapport: ${rapportId}`);
    console.log(`[AiDataService] URL: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Erreur lors du chargement des données d'analyse IA: ${response.status} ${response.statusText}`
        );
      }

      const data: RapportDataJSON = await response.json();

      console.log(`[AiDataService] Données d'analyse IA chargées avec succès`);
      console.log(`[AiDataService] Rapport: ${data.reportMetadata?.id || 'ID non disponible'}`);
      console.log('[AiDataService] 📦 PAYLOAD COMPLET reçu de l\'API rapportdataia:', JSON.stringify(data, null, 2));


      return data;
    } catch (error) {
      console.error('[AiDataService] Erreur lors du chargement des données d\'analyse IA:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erreur réseau: impossible de contacter l\'API. Vérifiez votre connexion internet.');
      }
      
      throw error;
    }
  }

  /**
   * Extrait l'ID du rapport depuis les paramètres de l'URL
   * @returns L'ID du rapport ou null si non trouvé
   */
  getRapportIdFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    let rapportId = urlParams.get('rapport');

    if (rapportId) {
      // Nettoyer le rapportId en cas de paramètres mal formés
      // Enlever tout ce qui suit un '?' ou '&' dans le rapportId
      rapportId = rapportId.split('?')[0].split('&')[0].trim();

      console.log(`[AiDataService] ID du rapport extrait de l'URL: ${rapportId}`);
    } else {
      console.warn('[AiDataService] Aucun paramètre "rapport" trouvé dans l\'URL');
    }

    return rapportId;
  }
}

/**
 * Instance singleton du service de données d'analyse IA
 */
export const aiDataService = new AiDataService();

