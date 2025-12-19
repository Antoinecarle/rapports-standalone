import { useState, useEffect } from 'react';
import { RapportDataServiceFactory } from '@/services/rapportDataService';
import { mapRapportData, type MappedRapportData } from '@/services/rapportDataMapper';

/**
 * États possibles du chargement des données
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Interface pour le résultat du hook
 */
export interface UseRapportDataResult {
  /** Données du rapport mappées et prêtes à l'emploi */
  data: MappedRapportData | null;
  /** État actuel du chargement */
  loadingState: LoadingState;
  /** Message d'erreur si une erreur s'est produite */
  error: string | null;
  /** Fonction pour recharger les données */
  reload: () => void;
  /** Indicateurs booléens pour faciliter les conditions */
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

/**
 * Hook personnalisé pour charger et gérer les données d'un rapport
 * 
 * @param rapportId - ID du rapport à charger (optionnel pour le mode fichier statique)
 * @returns Objet contenant les données, l'état de chargement et les fonctions utilitaires
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data, isLoading, isError, error } = useRapportData();
 *   
 *   if (isLoading) return <div>Chargement...</div>;
 *   if (isError) return <div>Erreur: {error}</div>;
 *   if (!data) return null;
 *   
 *   return <RapportDetail rapport={data.rapport} />;
 * }
 * ```
 */
export function useRapportData(rapportId?: string): UseRapportDataResult {
  const [data, setData] = useState<MappedRapportData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      // Réinitialiser l'état
      setLoadingState('loading');
      setError(null);

      try {
        // Obtenir le service de données
        const service = RapportDataServiceFactory.getService();
        
        // Charger les données brutes
        const rawData = await service.loadRapportData(rapportId);
        
        // Mapper les données vers les structures des composants
        const mappedData = mapRapportData(rawData);
        
        // Mettre à jour l'état seulement si le composant est toujours monté
        if (isMounted) {
          setData(mappedData);
          setLoadingState('success');
        }
      } catch (err) {
        // Gérer les erreurs
        const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue s\'est produite';
        
        if (isMounted) {
          setError(errorMessage);
          setLoadingState('error');
          console.error('Erreur lors du chargement des données du rapport:', err);
        }
      }
    };

    loadData();

    // Cleanup function pour éviter les mises à jour d'état sur un composant démonté
    return () => {
      isMounted = false;
    };
  }, [rapportId, reloadTrigger]);

  /**
   * Fonction pour recharger les données
   */
  const reload = () => {
    setReloadTrigger(prev => prev + 1);
  };

  return {
    data,
    loadingState,
    error,
    reload,
    // Indicateurs booléens pour faciliter les conditions
    isLoading: loadingState === 'loading',
    isError: loadingState === 'error',
    isSuccess: loadingState === 'success',
  };
}

/**
 * Hook alternatif qui lance une erreur en cas d'échec
 * Utile avec les Error Boundaries de React
 * 
 * @param rapportId - ID du rapport à charger
 * @returns Données du rapport (jamais null)
 * @throws Error si le chargement échoue
 */
export function useRapportDataOrThrow(rapportId?: string): MappedRapportData {
  const result = useRapportData(rapportId);

  if (result.isError) {
    throw new Error(result.error || 'Erreur lors du chargement des données');
  }

  if (!result.data) {
    // Pendant le chargement, on pourrait retourner des données par défaut
    // ou lancer une erreur de suspension (pour React Suspense)
    throw new Error('Données non disponibles');
  }

  return result.data;
}

