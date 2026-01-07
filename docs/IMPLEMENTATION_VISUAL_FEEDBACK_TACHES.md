# 🎨 Implémentation du Feedback Visuel pour les Tâches

## 📋 Objectif

Afficher un feedback visuel sur les photos de vérification des tâches en fonction de l'analyse IA :
- **Bordure verte** : Tâche validée, aucun problème détecté
- **Bordure rouge** : Problème détecté par l'IA sur cette tâche
- **Message d'alerte** : Description du problème détecté

## ✅ Modifications Effectuées

### 1. Types (`src/types/rapport.types.ts`)

**Ajout du champ `etapeId` à l'interface `Probleme`** :
```typescript
export interface Probleme {
  id: string;
  titre: string;
  description: string;
  severite: "faible" | "moyenne" | "elevee";
  detectionIA: boolean;
  consignesIA?: string[];
  estFaux?: boolean;
  etapeId?: string; // ✨ NOUVEAU : ID de l'étape associée au problème
}
```

### 2. Mapping (`src/services/rapportDataMapper.ts`)

**Préservation de l'`etapeId` lors du mapping** :
```typescript
problemes: piece.problemes.map(probleme => ({
  id: probleme.id,
  titre: probleme.titre,
  description: probleme.description,
  severite: probleme.severite,
  detectionIA: probleme.detectionIA,
  consignesIA: probleme.consignesIA || [],
  estFaux: probleme.estFaux || false,
  etapeId: probleme.etapeId // ✨ NOUVEAU : Préserver l'etapeId
})),
```

### 3. Composant UI (`src/components/rapport/RapportPieceDetail.tsx`)

#### A. Mise à jour des interfaces locales

**Ajout de `etapeId` aux interfaces** :
```typescript
interface TacheValidation {
  // ... autres champs
  etapeId?: string; // ✨ NOUVEAU
}

interface PieceData {
  // ... autres champs
  problemes: {
    // ... autres champs
    etapeId?: string; // ✨ NOUVEAU
  }[];
}
```

#### B. Fonction helper pour détecter les problèmes

```typescript
const tacheHasProblems = (tache: TacheValidation): boolean => {
  if (!tache.etapeId) return false;
  
  return piece.problemes.some(probleme => 
    probleme.etapeId === tache.etapeId && 
    probleme.detectionIA && 
    !probleme.estFaux // Ignorer les faux positifs
  );
};
```

#### C. Bordure conditionnelle sur la photo

```typescript
<img
  src={tache.photo_url}
  alt={`Photo de vérification: ${tache.nom}`}
  className={`w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 ${
    tacheHasProblems(tache) ? 'border-red-500' : 'border-green-300'
  }`}
  onClick={() => onPhotoClick(tache.photo_url!)}
/>
```

#### D. Message d'alerte sous les photos

```typescript
{tacheHasProblems(tache) && (
  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/20 dark:border-red-900">
    <div className="flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {piece.problemes
          .filter(p => p.etapeId === tache.etapeId && p.detectionIA && !p.estFaux)
          .map((probleme, idx) => (
            <p key={idx} className="text-xs text-red-700 dark:text-red-400">
              {probleme.description}
            </p>
          ))
        }
      </div>
    </div>
  </div>
)}
```

## 🎯 Logique de Détection

1. **Vérification de l'`etapeId`** : La tâche doit avoir un `etapeId` défini
2. **Correspondance avec les problèmes** : Recherche d'un problème ayant le même `etapeId`
3. **Filtrage** :
   - `detectionIA === true` : Problème détecté par l'IA
   - `estFaux === false` : Pas un faux positif marqué par l'utilisateur

## 📊 Flux de Données

```
API rapportdataia
  ↓
  Probleme { etapeId, ... }
  ↓
rapportDataMapper.ts (préserve etapeId)
  ↓
RapportPieceDetail.tsx
  ↓
tacheHasProblems(tache) → boolean
  ↓
Bordure rouge + Message d'alerte
```

## 🎨 Rendu Visuel

### ✅ Tâche sans problème
- Bordure verte (`border-green-300`)
- Pas de message d'alerte

### ❌ Tâche avec problème
- Bordure rouge (`border-red-500`)
- Message d'alerte avec :
  - Icône `AlertTriangle`
  - Fond rouge clair
  - Description du problème

## 🧪 Test

Pour tester l'implémentation :
1. Ouvrir un rapport avec des problèmes détectés par l'IA
2. Vérifier que les photos de vérification ont des bordures rouges
3. Vérifier que le message d'alerte s'affiche sous les photos
4. Vérifier que les faux positifs sont ignorés

## 📝 Notes

- Le label "Vérification" a été changé en "Prise" pour correspondre à la maquette
- Les faux positifs (`estFaux === true`) sont automatiquement exclus
- Le message d'alerte affiche la description complète du problème
- Support du mode sombre avec classes Tailwind appropriées

