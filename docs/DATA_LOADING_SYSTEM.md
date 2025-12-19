# Système de Chargement de Données - Documentation

## Vue d'ensemble

Ce document décrit le système de chargement de données mis en place pour l'application de rapports. Le système est conçu pour être évolutif et faciliter la migration future d'un fichier statique vers des appels API.

## Architecture

### 1. Types TypeScript (`src/types/rapport.types.ts`)

Définit toutes les interfaces TypeScript pour la structure complète du fichier `data.json` :

- `RapportDataJSON` : Structure complète du fichier data.json
- `ReportMetadata` : Métadonnées du rapport
- `SyntheseSection` : Données de synthèse
- `RemarquesGeneralesSection` : Remarques générales
- `PieceDetail` : Détails d'une pièce
- `SuggestionIA` : Suggestions de l'IA
- `CheckFinalItem` : Items du check final
- `UILabels` : Labels pour l'interface utilisateur

### 2. Service de Données (`src/services/rapportDataService.ts`)

#### Interface `IRapportDataService`

Interface abstraite qui définit le contrat pour charger les données :

```typescript
interface IRapportDataService {
  loadRapportData(rapportId?: string): Promise<RapportDataJSON>;
}
```

#### Implémentations

**`StaticFileRapportDataService`** (Actuelle)
- Charge les données depuis `/public/data.json`
- Utilise un cache pour éviter les rechargements inutiles
- Valide la structure des données chargées

**`APIRapportDataService`** (Future)
- Template pour la migration vers l'API
- Supporte l'authentification via token
- Gère les erreurs HTTP

#### Factory Pattern

`RapportDataServiceFactory` permet de basculer facilement entre les implémentations :

```typescript
// Utilisation par défaut (fichier statique)
const service = RapportDataServiceFactory.getService();

// Pour passer à l'API (futur)
RapportDataServiceFactory.setService(
  new APIRapportDataService('https://api.example.com', 'token')
);
```

### 3. Mapper de Données (`src/services/rapportDataMapper.ts`)

Transforme les données brutes du `data.json` vers les structures attendues par les composants React.

#### Fonctions de mapping

- `mapToAppRapport()` : Pour les props de App.tsx
- `mapToRapportSynthese()` : Pour RapportSynthese
- `mapToRemarquesGenerales()` : Pour RemarquesGenerales
- `mapToPiecesDetails()` : Pour RapportPieceDetail
- `mapToSuggestions()` : Pour RapportSuggestions
- `mapToCheckFinal()` : Pour RapportCheckFinal
- `mapRapportData()` : Fonction principale qui mappe toutes les données

#### Type `MappedRapportData`

Type retourné par `mapRapportData()` contenant toutes les données transformées :

```typescript
{
  rapport: {...},
  synthese: {...},
  remarquesGenerales: {...},
  pieces: [...],
  suggestions: [...],
  checkFinal: [...],
  uiLabels: {...}
}
```

### 4. Hook React (`src/hooks/useRapportData.ts`)

Hook personnalisé qui gère le chargement et l'état des données.

#### Interface `UseRapportDataResult`

```typescript
{
  data: MappedRapportData | null;
  loadingState: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  reload: () => void;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}
```

#### Utilisation

```typescript
function MyComponent() {
  const { data, isLoading, isError, error } = useRapportData();
  
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} />;
  if (!data) return null;
  
  return <RapportDetail rapport={data.rapport} rapportData={data} />;
}
```

#### Fonctionnalités

- Gestion automatique des états de chargement
- Prévention des fuites mémoire (cleanup sur démontage)
- Fonction `reload()` pour recharger les données
- Indicateurs booléens pour faciliter les conditions

## Flux de Données

```
1. Composant appelle useRapportData()
   ↓
2. Hook utilise RapportDataServiceFactory.getService()
   ↓
3. Service charge les données depuis /public/data.json
   ↓
4. Service valide la structure des données
   ↓
5. Hook utilise mapRapportData() pour transformer les données
   ↓
6. Hook retourne les données transformées au composant
   ↓
7. Composant affiche les données
```

## Migration vers l'API

Pour migrer vers une API, suivez ces étapes :

### 1. Configurer le service API

```typescript
// Dans votre fichier de configuration ou au démarrage de l'app
import { RapportDataServiceFactory, APIRapportDataService } from '@/services/rapportDataService';

RapportDataServiceFactory.setService(
  new APIRapportDataService(
    process.env.VITE_API_BASE_URL,
    authToken
  )
);
```

### 2. Adapter le backend

Assurez-vous que votre API retourne les données dans le même format que `data.json` :

```
GET /rapports/{rapportId}
Response: RapportDataJSON
```

### 3. Mettre à jour useRapportData

Si nécessaire, passez le `rapportId` au hook :

```typescript
const { data, isLoading, isError } = useRapportData(rapportId);
```

### 4. Aucun changement dans les composants

Les composants React n'ont pas besoin d'être modifiés car ils utilisent déjà les données transformées via le hook.

## Gestion des Cas Particuliers

### CheckFinalSection vide

Le mapper gère automatiquement le cas où `checkFinalSection` est vide :

```typescript
// Dans RapportDetail.tsx
{checkFinal.length > 0 && (
  <RapportCheckFinal checkItems={checkFinal} onPhotoClick={handlePhotoClick} />
)}
```

### Validation des données

Le service valide automatiquement la structure des données :

- Vérifie la présence des sections requises
- Vérifie que les tableaux sont bien des tableaux
- Lance une erreur explicite en cas de problème

### Gestion des erreurs

Le hook gère trois états :
- `loading` : Chargement en cours
- `success` : Données chargées avec succès
- `error` : Erreur lors du chargement (avec message d'erreur)

## Fichiers Créés

```
rapports-standalone/
├── src/
│   ├── types/
│   │   └── rapport.types.ts          # Types TypeScript
│   ├── services/
│   │   ├── rapportDataService.ts     # Service de chargement
│   │   └── rapportDataMapper.ts      # Fonctions de mapping
│   ├── hooks/
│   │   └── useRapportData.ts         # Hook React
│   ├── components/
│   │   ├── App.tsx                   # Utilise le hook
│   │   └── RapportDetail.tsx         # Utilise les données
└── public/
    └── data.json                      # Données statiques
```

## Avantages du Système

1. **Séparation des préoccupations** : Chargement, transformation et affichage sont séparés
2. **Évolutivité** : Facile de passer du fichier statique à l'API
3. **Type-safety** : TypeScript garantit la cohérence des données
4. **Réutilisabilité** : Le hook peut être utilisé dans n'importe quel composant
5. **Testabilité** : Chaque couche peut être testée indépendamment
6. **Gestion d'état** : États de chargement gérés automatiquement
7. **Performance** : Cache intégré pour éviter les rechargements inutiles

## Maintenance

### Ajouter un nouveau champ

1. Mettre à jour `rapport.types.ts`
2. Mettre à jour la fonction de mapping appropriée dans `rapportDataMapper.ts`
3. Utiliser le nouveau champ dans les composants

### Changer la source de données

Utiliser `RapportDataServiceFactory.setService()` avec une nouvelle implémentation de `IRapportDataService`

### Déboguer

- Vérifier la console du navigateur pour les erreurs de chargement
- Utiliser `reload()` pour forcer un rechargement
- Vérifier que `data.json` est bien dans `/public/`

