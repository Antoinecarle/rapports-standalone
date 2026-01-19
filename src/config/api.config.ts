/**
 * Configuration centralisée pour les appels API
 * Gère le versioning dynamique basé sur les paramètres d'URL
 */

export type ApiVersion = 'test' | 'live';

class ApiConfig {
  private static instance: ApiConfig;
  private version: ApiVersion = 'test'; // Version par défaut

  private baseUrl: string = 'https://checkeasy-57905.bubbleapps.io';

  private constructor() {
    // Détecter la version depuis l'URL au chargement
    this.detectVersionFromUrl();
    
    // Écouter les changements d'URL (pour les SPA)
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        this.detectVersionFromUrl();
      });
    }
  }

  /**
   * Récupère l'instance singleton de la configuration
   */
  public static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      ApiConfig.instance = new ApiConfig();
    }
    return ApiConfig.instance;
  }

  /**
   * Détecte la version depuis les paramètres d'URL
   */
  private detectVersionFromUrl(): void {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const versionParam = urlParams.get('version');

    if (versionParam === 'test' || versionParam === 'live') {
      this.version = versionParam;
      console.log(`[ApiConfig] Version détectée depuis l'URL: ${this.version}`);
    } else {
      console.log(`[ApiConfig] Aucune version spécifiée dans l'URL, utilisation de la version par défaut: ${this.version}`);
    }
  }

  /**
   * Récupère la version actuelle
   */
  public getVersion(): ApiVersion {
    return this.version;
  }

  /**
   * Définit manuellement la version (utile pour les tests)
   */
  public setVersion(version: ApiVersion): void {
    this.version = version;
    console.log(`[ApiConfig] Version définie manuellement: ${this.version}`);
  }

  /**
   * Récupère l'URL de base de l'API avec la version appropriée
   */
  public getApiBaseUrl(): string {
    return `${this.baseUrl}/version-${this.version}/api/1.1/wf`;
  }

  /**
   * Construit une URL complète pour un endpoint donné
   * @param endpoint - Le nom de l'endpoint (ex: 'rapportfulldata')
   * @param params - Les paramètres de requête (ex: { rapport: '123' })
   */
  public buildUrl(endpoint: string, params?: Record<string, string>): string {
    const baseUrl = this.getApiBaseUrl();
    let url = `${baseUrl}/${endpoint}`;

    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    return url;
  }

  /**
   * Récupère l'URL de base sans version (pour des cas spéciaux)
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Définit l'URL de base (utile pour les environnements de développement)
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
    console.log(`[ApiConfig] URL de base définie: ${this.baseUrl}`);
  }
}

/**
 * Instance singleton de la configuration API
 * Utiliser cette instance dans tous les services
 */
export const apiConfig = ApiConfig.getInstance();

/**
 * Helper pour récupérer rapidement l'URL de base de l'API
 */
export const getApiBaseUrl = (): string => apiConfig.getApiBaseUrl();

/**
 * Helper pour construire une URL d'endpoint
 */
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => 
  apiConfig.buildUrl(endpoint, params);

