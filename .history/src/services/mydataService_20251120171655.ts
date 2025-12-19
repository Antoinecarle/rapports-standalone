import type { MyDataJSON } from '@/types/mydata.types';
import { apiConfig } from '@/config/api.config';

/**
 * Service pour récupérer les données brutes du parcours depuis l'API Bubble
 */
class MyDataService {

  /**
   * Récupère les données brutes du parcours pour un rapport donné
   * @param rapportId - L'ID du rapport
   * @returns Promise avec les données du parcours
   */
  async fetchMyData(rapportId: string): Promise<MyDataJSON> {
    try {
      const url = apiConfig.buildUrl('rapportdata', { rapport: rapportId });

      console.log(`[MyDataService] Fetching mydata for rapport: ${rapportId}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MyDataJSON = await response.json();

      console.log(`[MyDataService] Successfully fetched mydata for rapport ${rapportId}`);

      return data;
    } catch (error) {
      console.error('[MyDataService] Error fetching mydata:', error);
      throw new Error(
        `Impossible de charger les données du parcours depuis l'API: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }
}

/**
 * Instance singleton du service mydata
 */
export const myDataService = new MyDataService();

