# Intégration de `logement_name` et `score_explanation`

## 📋 Résumé des modifications

Ce document décrit l'intégration de deux nouveaux champs dans le rapport :
1. **`logement_name`** : Nom du logement (prioritaire sur l'adresse)
2. **`score_explanation`** : Explication en langage naturel de la note globale

---

## 🆕 Nouveaux champs dans le payload API

### Webhook 2 (individual-report) - `rapportfulldata`

```json
{
  "logementName": "Appartement Marais",  // 🆕 NOUVEAU
  "dataia": {
    "analysis_enrichment": {
      "global_score": {
        "score": 4.5,
        "label": "TRÈS BON",
        "description": "Score calculé algorithmiquement...",
        "score_explanation": "Très bon état global. Sur 5 pièces..."  // 🆕 NOUVEAU
      }
    }
  }
}
```

---

## 🔧 Modifications apportées

### 1. **Types TypeScript** (`src/services/fullDataService.ts`)

Ajout des interfaces pour `analysis_enrichment` et `global_score` :

```typescript
export interface GlobalScore {
  score: number;
  label: string;
  description: string;
  score_explanation?: string;  // 🆕
}

export interface AnalysisEnrichment {
  global_score: GlobalScore;
}

export interface DataIA {
  analysis_enrichment?: AnalysisEnrichment;
  [key: string]: any;
}
```

### 2. **Type SyntheseSection** (`src/types/rapport.types.ts`)

Ajout du champ `scoreExplanation` :

```typescript
export interface SyntheseSection {
  // ... autres champs
  scoreExplanation?: string;  // 🆕
}
```

### 3. **Extraction des données** (`src/services/rapportDataMapper.ts`)

#### a) Nom du logement (déjà fait précédemment)
```typescript
const logement = data.fullData?.logementName && data.fullData.logementName.trim() !== ""
  ? data.fullData.logementName  // Priorité au nom
  : (syntheseSection.logement &&
    syntheseSection.logement !== "Adresse non renseignée" &&
    syntheseSection.logement.trim() !== ""
    ? syntheseSection.logement  // Fallback sur l'adresse
    : "Logement non renseigné");
```

#### b) Explication du score (nouveau)
```typescript
const scoreExplanation = data.fullData?.dataia?.analysis_enrichment?.global_score?.score_explanation;

return {
  // ... autres champs
  scoreExplanation,  // 🆕
};
```

### 4. **Affichage dans l'interface** (`src/components/rapport/RapportSynthese.tsx`)

#### a) Ajout dans l'interface du composant
```typescript
interface RapportSyntheseProps {
  rapport: {
    // ... autres champs
    scoreExplanation?: string;  // 🆕
  };
}
```

#### b) Affichage sous la note générale
```tsx
<div className="flex flex-col items-center gap-2 mb-6 md:mb-8 pb-4 md:pb-6 border-b">
  <div className="flex items-center gap-0.5 md:gap-1">
    {/* Étoiles */}
  </div>
  <span className="text-xl md:text-2xl font-bold">{rapport.noteGenerale}/5</span>
  
  {/* 🆕 Explication de la note */}
  {rapport.scoreExplanation && (
    <p className="text-sm text-muted-foreground text-center mt-2 max-w-2xl">
      {rapport.scoreExplanation}
    </p>
  )}
</div>
```

---

## ✅ Résultat attendu

### Avant
- **Logement** : "128 Bd Auguste Blanqui, 75013 Paris, France"
- **Note** : 4.5/5 (sans explication)

### Après
- **Logement** : "Appartement Marais"
- **Note** : 4.5/5
- **Explication** : "Très bon état global. Sur 5 pièces analysées, nous avons relevé 2 problèmes modérés, 1 détail mineur. La note reflète l'importance relative des pièces (cuisine et salle de bain comptent davantage)."

---

## 🧪 Test

Pour tester l'intégration :

1. **Déployer les modifications API** avec les nouveaux champs `logementName` et `score_explanation`
2. **Créer un nouveau rapport** (les anciens rapports n'auront pas ces champs)
3. **Vérifier l'affichage** :
   - Le nom du logement s'affiche au lieu de l'adresse
   - L'explication de la note apparaît sous les étoiles

---

## 📝 Notes

- Les deux champs sont **optionnels** (avec `?`)
- Si `logementName` n'est pas disponible, l'adresse s'affiche (fallback)
- Si `score_explanation` n'est pas disponible, rien ne s'affiche (pas d'erreur)
- Compatible avec les anciens rapports qui n'ont pas ces champs

