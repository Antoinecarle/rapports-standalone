import type { RapportDataJSON } from '@/types/rapport.types';
import type { FusedRapportData } from './dataFusionService';
import { dataFusionService } from './dataFusionService';

/**
 * Interface abstraite pour le service de données de rapport
 * Cette interface permet de facilement remplacer l'implémentation
 * (fichier statique → API) sans changer le code consommateur
 */
export interface IRapportDataService {
  /**
   * Charge les données d'un rapport
   * @param rapportId - ID du rapport à charger (optionnel pour le mode fichier statique)
   * @returns Promise contenant les données du rapport (fusionnées avec mydata.json)
   */
  loadRapportData(rapportId?: string): Promise<FusedRapportData>;
}

/**
 * Implémentation du service qui charge les données depuis des fichiers JSON statiques
 * Charge et fusionne data.json (analyses IA) et mydata.json (données brutes)
 * Cette implémentation sera remplacée par une version API plus tard
 */
export class StaticFileRapportDataService implements IRapportDataService {
  private dataCache: FusedRapportData | null = null;

  /**
   * Charge et fusionne les données depuis data.json et mydata.json
   * Pour l'instant, ignore le rapportId car on a un seul fichier statique
   */
  async loadRapportData(_rapportId?: string): Promise<FusedRapportData> {
    // Si les données sont déjà en cache, les retourner directement
    if (this.dataCache) {
      return this.dataCache;
    }

    try {
      // Utiliser le service de fusion pour charger et combiner les données
      const fusedData = await dataFusionService.loadAndFuseData();

      // Valider que les données ont la structure attendue
      this.validateRapportData(fusedData);

      // Mettre en cache
      this.dataCache = fusedData;

      return fusedData;
    } catch (error) {
      console.error('Erreur lors du chargement des données du rapport:', error);
      throw new Error(
        `Impossible de charger les données du rapport: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }

  /**
   * Valide la structure des données chargées
   */
  private validateRapportData(data: any): asserts data is FusedRapportData {
    if (!data) {
      throw new Error('Les données du rapport sont vides');
    }

    const requiredSections = [
      'reportMetadata',
      'syntheseSection',
      'remarquesGeneralesSection',
      'detailParPieceSection',
      'suggestionsIASection',
      'rawData',
      'piecesWithRawData'
    ];

    for (const section of requiredSections) {
      if (!(section in data)) {
        throw new Error(`Section manquante dans les données: ${section}`);
      }
    }

    // Vérifier que detailParPieceSection est un tableau
    if (!Array.isArray(data.detailParPieceSection)) {
      throw new Error('detailParPieceSection doit être un tableau');
    }

    // Vérifier que suggestionsIASection est un tableau
    if (!Array.isArray(data.suggestionsIASection)) {
      throw new Error('suggestionsIASection doit être un tableau');
    }

    // Vérifier que rawData existe
    if (!data.rawData || !data.rawData.agent || !data.rawData.parcours) {
      throw new Error('Les données brutes (rawData) sont incomplètes');
    }
  }

  /**
   * Vide le cache (utile pour forcer un rechargement)
   */
  clearCache(): void {
    this.dataCache = null;
  }
}

/**
 * Implémentation future du service qui chargera les données depuis une API
 * Cette classe servira de template pour la migration vers l'API
 * L'API devra retourner les données déjà fusionnées (IA + données brutes)
 */
export class APIRapportDataService implements IRapportDataService {
  private apiBaseUrl: string;
  private authToken?: string;

  constructor(apiBaseUrl: string, authToken?: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.authToken = authToken;
  }

  async loadRapportData(rapportId?: string): Promise<FusedRapportData> {
    if (!rapportId) {
      throw new Error('rapportId est requis pour charger les données depuis l\'API');
    }

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      // L'API devra retourner les données fusionnées
      // Endpoint suggéré: GET /api/rapports/{rapportId}/fused
      const response = await fetch(`${this.apiBaseUrl}/rapports/${rapportId}/fused`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const data: FusedRapportData = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des données depuis l\'API:', error);
      throw new Error(
        `Impossible de charger les données du rapport depuis l'API: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }
}

/**
 * Factory pour créer l'instance appropriée du service
 * Permet de basculer facilement entre fichier statique et API
 */
export class RapportDataServiceFactory {
  private static instance: IRapportDataService | null = null;

  /**
   * Obtient l'instance du service de données
   * Par défaut, utilise le service de fichier statique
   * Pour passer à l'API, appeler setService() avec une instance d'APIRapportDataService
   */
  static getService(): IRapportDataService {
    if (!this.instance) {
      // Par défaut, utiliser le service de fichier statique
      this.instance = new StaticFileRapportDataService();
    }
    return this.instance;
  }

  /**
   * Définit l'instance du service à utiliser
   * Permet de basculer entre fichier statique et API
   */
  static setService(service: IRapportDataService): void {
    this.instance = service;
  }

  /**
   * Réinitialise le service (utile pour les tests)
   */
  static reset(): void {
    this.instance = null;
  }
}

/**
 * Export d'une instance par défaut pour faciliter l'utilisation
 */
export const rapportDataService = RapportDataServiceFactory.getService();

