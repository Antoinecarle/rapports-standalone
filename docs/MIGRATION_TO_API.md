# Guide de Migration vers l'API

## Vue d'ensemble

Ce guide explique comment migrer du chargement de fichier statique (`data.json`) vers des appels API.

## Étapes de Migration

### 1. Préparer votre API Backend

Votre API doit exposer un endpoint qui retourne les données dans le même format que `data.json` :

```
GET /api/rapports/{rapportId}
```

**Réponse attendue** : Structure identique à `data.json` (voir `src/types/rapport.types.ts`)

```json
{
  "reportMetadata": { ... },
  "syntheseSection": { ... },
  "remarquesGeneralesSection": { ... },
  "detailParPieceSection": [ ... ],
  "checkFinalSection": [ ... ],
  "suggestionsIASection": [ ... ],
  "uiLabels": { ... }
}
```

### 2. Configurer les Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_API_BASE_URL=https://votre-api.com/api
VITE_API_TOKEN=votre-token-optionnel
```

### 3. Créer un Fichier de Configuration

Créez `src/config/api.config.ts` :

```typescript
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  token: import.meta.env.VITE_API_TOKEN,
};
```

### 4. Initialiser le Service API

Modifiez `src/main.tsx` (ou créez un fichier d'initialisation) :

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RapportDataServiceFactory, APIRapportDataService } from './services/rapportDataService'
import { apiConfig } from './config/api.config'

// Configurer le service API
if (apiConfig.baseUrl && apiConfig.baseUrl !== 'http://localhost:3000/api') {
  RapportDataServiceFactory.setService(
    new APIRapportDataService(apiConfig.baseUrl, apiConfig.token)
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### 5. Mettre à Jour App.tsx (si nécessaire)

Si vous devez passer un `rapportId` dynamique :

```typescript
import { useRapportData } from '@/hooks/useRapportData'
import { useParams } from 'react-router-dom' // Si vous utilisez React Router

function App() {
  const { rapportId } = useParams(); // Ou récupérer l'ID d'une autre manière
  const { data, isLoading, isError, error } = useRapportData(rapportId);
  
  // ... reste du code
}
```

### 6. Tester la Migration

1. **Mode développement avec fichier statique** :
   ```bash
   npm run dev
   ```
   L'application devrait fonctionner comme avant.

2. **Mode développement avec API** :
   - Configurez `.env` avec votre URL d'API
   - Redémarrez le serveur de développement
   - Vérifiez que les données sont chargées depuis l'API

3. **Vérifier les erreurs** :
   - Ouvrez la console du navigateur
   - Vérifiez l'onglet Network pour voir les requêtes API
   - Assurez-vous qu'il n'y a pas d'erreurs CORS

## Migration Progressive

Vous pouvez migrer progressivement en utilisant un flag :

```typescript
// src/config/api.config.ts
export const apiConfig = {
  useAPI: import.meta.env.VITE_USE_API === 'true',
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  token: import.meta.env.VITE_API_TOKEN,
};

// src/main.tsx
if (apiConfig.useAPI && apiConfig.baseUrl) {
  RapportDataServiceFactory.setService(
    new APIRapportDataService(apiConfig.baseUrl, apiConfig.token)
  );
}
```

Puis dans `.env` :

```env
VITE_USE_API=false  # Utiliser le fichier statique
# VITE_USE_API=true  # Utiliser l'API
VITE_API_BASE_URL=https://votre-api.com/api
```

## Gestion de l'Authentification

### Avec Token Statique

```typescript
new APIRapportDataService(apiConfig.baseUrl, 'votre-token-statique')
```

### Avec Token Dynamique (après login)

```typescript
// Après le login de l'utilisateur
const authToken = await login(username, password);

// Mettre à jour le service
RapportDataServiceFactory.setService(
  new APIRapportDataService(apiConfig.baseUrl, authToken)
);
```

### Avec Refresh Token

Vous devrez étendre `APIRapportDataService` :

```typescript
export class APIRapportDataServiceWithRefresh extends APIRapportDataService {
  private refreshToken: string;

  constructor(apiBaseUrl: string, authToken: string, refreshToken: string) {
    super(apiBaseUrl, authToken);
    this.refreshToken = refreshToken;
  }

  async loadRapportData(rapportId?: string): Promise<RapportDataJSON> {
    try {
      return await super.loadRapportData(rapportId);
    } catch (error) {
      // Si erreur 401, rafraîchir le token
      if (error.message.includes('401')) {
        await this.refreshAuthToken();
        return await super.loadRapportData(rapportId);
      }
      throw error;
    }
  }

  private async refreshAuthToken(): Promise<void> {
    // Logique de rafraîchissement du token
    const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });
    
    const { accessToken } = await response.json();
    this.authToken = accessToken;
  }
}
```

## Gestion des Erreurs API

Le service API gère déjà les erreurs de base. Pour une gestion plus avancée :

```typescript
// Dans votre composant
const { data, isError, error, reload } = useRapportData(rapportId);

if (isError) {
  // Afficher un message d'erreur personnalisé
  if (error?.includes('404')) {
    return <div>Rapport non trouvé</div>;
  }
  if (error?.includes('401')) {
    return <div>Non autorisé. Veuillez vous connecter.</div>;
  }
  if (error?.includes('500')) {
    return <div>Erreur serveur. Veuillez réessayer plus tard.</div>;
  }
  
  return (
    <div>
      <p>Erreur: {error}</p>
      <button onClick={reload}>Réessayer</button>
    </div>
  );
}
```

## Optimisations

### Cache côté client

Le service utilise déjà un cache simple. Pour un cache plus avancé, utilisez React Query :

```bash
npm install @tanstack/react-query
```

```typescript
// src/hooks/useRapportData.ts
import { useQuery } from '@tanstack/react-query';
import { RapportDataServiceFactory } from '@/services/rapportDataService';
import { mapRapportData } from '@/services/rapportDataMapper';

export function useRapportData(rapportId?: string) {
  return useQuery({
    queryKey: ['rapport', rapportId],
    queryFn: async () => {
      const service = RapportDataServiceFactory.getService();
      const rawData = await service.loadRapportData(rapportId);
      return mapRapportData(rawData);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### Pagination

Si vous avez beaucoup de rapports, implémentez la pagination :

```typescript
export interface IRapportDataService {
  loadRapportData(rapportId?: string): Promise<RapportDataJSON>;
  loadRapportsList(page: number, limit: number): Promise<RapportListResponse>;
}
```

## Checklist de Migration

- [ ] API backend prête et testée
- [ ] Variables d'environnement configurées
- [ ] Service API initialisé dans `main.tsx`
- [ ] Tests en développement réussis
- [ ] Gestion des erreurs implémentée
- [ ] Authentification configurée (si nécessaire)
- [ ] Tests en production réussis
- [ ] Documentation mise à jour
- [ ] Équipe formée sur le nouveau système

## Rollback

Si vous devez revenir au fichier statique :

1. Commentez l'initialisation du service API dans `main.tsx`
2. Ou définissez `VITE_USE_API=false` dans `.env`
3. Redémarrez l'application

Le système reviendra automatiquement au `StaticFileRapportDataService`.

## Support

Pour toute question ou problème :
1. Consultez la documentation dans `docs/DATA_LOADING_SYSTEM.md`
2. Vérifiez les logs de la console du navigateur
3. Vérifiez les logs du serveur API
4. Contactez l'équipe de développement

