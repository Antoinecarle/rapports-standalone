# ✅ Checklist d'Implémentation - Système de Faux Positifs et Consignes IA

## 📋 Vue d'Ensemble

Ce document fournit une checklist étape par étape pour implémenter le système enrichi de signalements avec faux positifs et consignes IA.

---

## Phase 1 : Configuration Bubble.io (Backend)

### Étape 1.1 : Créer la Table `FauxPositif`

- [ ] Créer une nouvelle table de données nommée `FauxPositif`
- [ ] Ajouter les champs suivants :

| Champ | Type | Options | Description |
|-------|------|---------|-------------|
| `rapport_ref` | Rapport | Relation | Référence au rapport parent |
| `piece_ref` | Text | - | ID de la pièce (ex: "1763563428946x849625088538311400") |
| `probleme_id` | Text | - | ID du problème IA (ex: "p1", "p2") |
| `probleme_titre` | Text | Optionnel | Titre du problème pour référence |
| `raison` | Text | Optionnel | Raison du marquage comme faux positif |
| `marque_par_user_id` | Text | - | ID de l'utilisateur (ex: "+33687451235") |
| `marque_par_nom` | Text | - | Nom complet de l'utilisateur |
| `Created Date` | Date | Auto | Date de création |
| `Modified Date` | Date | Auto | Date de modification |

- [ ] Configurer les permissions d'accès
- [ ] Tester la création manuelle d'un enregistrement

### Étape 1.2 : Créer la Table `ConsigneIA`

- [ ] Créer une nouvelle table de données nommée `ConsigneIA`
- [ ] Ajouter les champs suivants :

| Champ | Type | Options | Description |
|-------|------|---------|-------------|
| `rapport_ref` | Rapport | Relation | Référence au rapport parent |
| `piece_ref` | Text | - | ID de la pièce |
| `probleme_id` | Text | Optionnel | ID du problème lié (peut être null) |
| `type` | Option Set | "ignorer", "surveiller" | Type de consigne |
| `consigne` | Text | - | Texte de la consigne |
| `cree_par_user_id` | Text | - | ID de l'utilisateur créateur |
| `cree_par_nom` | Text | - | Nom complet de l'utilisateur |
| `Created Date` | Date | Auto | Date de création |
| `Modified Date` | Date | Auto | Date de modification |

- [ ] Créer l'Option Set pour le champ `type` avec les valeurs : `ignorer`, `surveiller`
- [ ] Configurer les permissions d'accès
- [ ] Tester la création manuelle d'un enregistrement

### Étape 1.3 : Modifier le Workflow `signalementlist`

- [ ] Ouvrir le workflow API `signalementlist`
- [ ] Ajouter une action "Search for FauxPositifs"
  - [ ] Contrainte : `rapport_ref = Get data from URL (rapportid)`
  - [ ] Trier par `Created Date` (descendant)
- [ ] Ajouter une action "Search for ConsignesIA"
  - [ ] Contrainte : `rapport_ref = Get data from URL (rapportid)`
  - [ ] Trier par `Created Date` (descendant)
- [ ] Modifier l'action "Return data from API"
  - [ ] Ajouter le champ `fauxPositifs` avec les résultats de la recherche
  - [ ] Ajouter le champ `consignesIA` avec les résultats de la recherche
- [ ] Tester l'endpoint avec un rapport existant
- [ ] Vérifier que la structure JSON retournée est correcte

**Exemple de structure attendue :**
```json
{
  "status": "success",
  "response": {
    "signalement": [...],
    "fauxPositifs": [...],
    "consignesIA": [...]
  }
}
```

### Étape 1.4 : Modifier le Workflow `endpointrapportform`

#### Action `MARK_FALSE_POSITIVE`

- [ ] Localiser la section qui traite l'action `MARK_FALSE_POSITIVE`
- [ ] Ajouter une action "Create a new thing" → `FauxPositif`
  - [ ] `rapport_ref` = Request data's rapportId (rechercher le rapport)
  - [ ] `piece_ref` = Request data's actions first item's data's pieceId
  - [ ] `probleme_id` = Request data's actions first item's data's problemeId
  - [ ] `probleme_titre` = (optionnel, peut être récupéré depuis rapportdataia)
  - [ ] `raison` = Request data's actions first item's data's raison (si fourni)
  - [ ] `marque_par_user_id` = Request data's userId
  - [ ] `marque_par_nom` = Request data's userId (ou nom complet si disponible)
- [ ] Tester avec une requête POST

#### Action `CREATE_CONSIGNE_IA`

- [ ] Localiser la section qui traite l'action `CREATE_CONSIGNE_IA`
- [ ] Ajouter une action "Create a new thing" → `ConsigneIA`
  - [ ] `rapport_ref` = Request data's rapportId (rechercher le rapport)
  - [ ] `piece_ref` = Request data's actions first item's data's pieceId
  - [ ] `probleme_id` = Request data's actions first item's data's problemeId
  - [ ] `type` = Request data's actions first item's data's type
  - [ ] `consigne` = Request data's actions first item's data's consigne
  - [ ] `cree_par_user_id` = Request data's userId
  - [ ] `cree_par_nom` = Request data's userId (ou nom complet si disponible)
- [ ] Tester avec une requête POST

### Étape 1.5 : Tests Backend

- [ ] Tester la création d'un faux positif via l'API
- [ ] Tester la création d'une consigne IA via l'API
- [ ] Vérifier que les données sont bien enregistrées dans la base
- [ ] Tester la récupération via `signalementlist`
- [ ] Vérifier que les relations entre tables fonctionnent

---

## Phase 2 : Adaptation du Frontend (React)

### Étape 2.1 : Mettre à Jour les Types TypeScript

- [ ] Ouvrir `src/types/mydata.types.ts`
- [ ] Ajouter l'interface `FauxPositif` :

```typescript
export interface FauxPositif {
  _id: string;
  rapport_ref: string;
  piece_ref: string;
  probleme_id: string;
  probleme_titre?: string;
  raison?: string;
  marque_par_user_id: string;
  marque_par_nom: string;
  created_date: number;
  modified_date: number;
}
```

- [ ] Ajouter l'interface `ConsigneIA` :

```typescript
export interface ConsigneIA {
  _id: string;
  rapport_ref: string;
  piece_ref: string;
  probleme_id?: string;
  type: 'ignorer' | 'surveiller';
  consigne: string;
  cree_par_user_id: string;
  cree_par_nom: string;
  created_date: number;
  modified_date: number;
}
```

- [ ] Modifier `BubbleSignalementResponse` :

```typescript
export interface BubbleSignalementResponse {
  status: string;
  response: {
    signalement: BubbleSignalement[];
    fauxPositifs?: FauxPositif[];
    consignesIA?: ConsigneIA[];
  };
}
```

- [ ] Vérifier qu'il n'y a pas d'erreurs TypeScript

### Étape 2.2 : Adapter le Service de Signalements

- [ ] Ouvrir `src/services/signalementsService.ts`
- [ ] Modifier la méthode `fetchSignalements` pour retourner les données enrichies
- [ ] Ajouter des méthodes pour accéder aux faux positifs et consignes IA :

```typescript
async fetchFauxPositifs(rapportId: string): Promise<FauxPositif[]> {
  const data = await this.fetchSignalements(rapportId);
  return data.fauxPositifs || [];
}

async fetchConsignesIA(rapportId: string): Promise<ConsigneIA[]> {
  const data = await this.fetchSignalements(rapportId);
  return data.consignesIA || [];
}
```

- [ ] Tester que les données sont bien récupérées

### Étape 2.3 : Adapter le Mapper de Données

- [ ] Ouvrir `src/services/rapportDataMapper.ts`
- [ ] Modifier la fonction `mapToPiecesDetails` pour injecter les faux positifs :

```typescript
// Extraire les faux positifs pour cette pièce
const fauxPositifsIds = data.rawData.bubbleSignalements?.response?.fauxPositifs
  ?.filter(fp => fp.piece_ref === piece.id)
  ?.map(fp => fp.probleme_id) || [];

// Marquer les problèmes comme faux
const problemesAvecFauxPositifs = piece.problemes.map(probleme => ({
  ...probleme,
  estFaux: fauxPositifsIds.includes(probleme.id)
}));
```

- [ ] Ajouter les consignes IA à chaque pièce :

```typescript
const consignesIA = data.rawData.bubbleSignalements?.response?.consignesIA
  ?.filter(c => c.piece_ref === piece.id) || [];

return {
  ...piece,
  problemes: problemesAvecFauxPositifs,
  consignesIA: consignesIA
};
```

- [ ] Mettre à jour l'interface `PieceDetail` dans `rapport.types.ts` :

```typescript
export interface PieceDetail {
  // ... champs existants
  consignesIA?: ConsigneIA[];
}
```

### Étape 2.4 : Adapter l'Interface Utilisateur

#### Affichage des Problèmes

- [ ] Ouvrir le composant qui affiche les problèmes (probablement dans `RapportPieceDetail.tsx`)
- [ ] Modifier l'affichage pour gérer les faux positifs :

```typescript
{piece.problemes.map(probleme => (
  <div 
    key={probleme.id}
    className={probleme.estFaux ? 'opacity-50 line-through' : ''}
  >
    {probleme.estFaux && (
      <Badge variant="secondary">Faux positif</Badge>
    )}
    {/* ... reste de l'affichage */}
  </div>
))}
```

#### Affichage des Consignes IA

- [ ] Ajouter une section pour afficher les consignes IA :

```typescript
{piece.consignesIA && piece.consignesIA.length > 0 && (
  <div className="mt-4 p-4 bg-blue-50 rounded">
    <h4 className="font-semibold mb-2">📝 Consignes pour l'IA</h4>
    {piece.consignesIA.map(consigne => (
      <div 
        key={consigne._id}
        className={`mb-2 p-2 rounded ${
          consigne.type === 'ignorer' ? 'bg-gray-100' : 'bg-orange-100'
        }`}
      >
        <Badge>{consigne.type === 'ignorer' ? '🔕 Ignorer' : '⚠️ Surveiller'}</Badge>
        <p className="text-sm mt-1">{consigne.consigne}</p>
        <p className="text-xs text-gray-500 mt-1">
          Ajouté par {consigne.cree_par_nom} le {new Date(consigne.created_date).toLocaleDateString()}
        </p>
      </div>
    ))}
  </div>
)}
```

### Étape 2.5 : Tests Frontend

- [ ] Tester l'affichage d'un rapport avec faux positifs
- [ ] Vérifier que les problèmes marqués comme faux sont bien grisés/masqués
- [ ] Tester l'affichage des consignes IA
- [ ] Vérifier que les consignes "ignorer" et "surveiller" ont des styles différents
- [ ] Tester sur mobile et desktop

---

## Phase 3 : Tests d'Intégration

### Étape 3.1 : Scénario de Test Complet

- [ ] **Test 1 : Créer un faux positif**
  1. Charger un rapport avec des problèmes IA
  2. Cliquer sur "Marquer comme faux" sur un problème
  3. Vérifier que le problème est grisé/masqué
  4. Recharger la page et vérifier que le marquage persiste

- [ ] **Test 2 : Créer une consigne IA "ignorer"**
  1. Cliquer sur "Ajouter consigne IA"
  2. Choisir "Ignorer" et écrire une consigne
  3. Vérifier que la consigne s'affiche avec le bon style
  4. Recharger la page et vérifier que la consigne persiste

- [ ] **Test 3 : Créer une consigne IA "surveiller"**
  1. Cliquer sur "Ajouter consigne IA"
  2. Choisir "Surveiller" et écrire une consigne
  3. Vérifier que la consigne s'affiche en orange/rouge
  4. Recharger la page et vérifier que la consigne persiste

- [ ] **Test 4 : Vérifier les données dans Bubble**
  1. Ouvrir la base de données Bubble
  2. Vérifier que les `FauxPositif` sont bien créés
  3. Vérifier que les `ConsigneIA` sont bien créées
  4. Vérifier les relations avec les rapports

### Étape 3.2 : Tests de Performance

- [ ] Tester avec un rapport contenant 10+ faux positifs
- [ ] Tester avec un rapport contenant 10+ consignes IA
- [ ] Vérifier que le temps de chargement reste acceptable
- [ ] Vérifier qu'il n'y a pas de ralentissement dans l'UI

---

## Phase 4 : Documentation et Déploiement

### Étape 4.1 : Documentation

- [ ] Mettre à jour le README avec les nouvelles fonctionnalités
- [ ] Documenter les nouveaux endpoints dans `API_ENDPOINT_UNIVERSEL.md`
- [ ] Créer des captures d'écran de l'interface
- [ ] Documenter les cas d'usage

### Étape 4.2 : Déploiement

- [ ] Tester en environnement `version-test`
- [ ] Vérifier que tout fonctionne correctement
- [ ] Déployer en environnement `version-live`
- [ ] Vérifier le déploiement sur Railway
- [ ] Tester avec des utilisateurs réels

---

## 📊 Résumé des Modifications

### Backend (Bubble.io)
- ✅ 2 nouvelles tables : `FauxPositif`, `ConsigneIA`
- ✅ 1 endpoint modifié : `signalementlist`
- ✅ 1 workflow modifié : `endpointrapportform`

### Frontend (React)
- ✅ 3 nouveaux types TypeScript
- ✅ 1 service modifié : `signalementsService.ts`
- ✅ 1 mapper modifié : `rapportDataMapper.ts`
- ✅ Composants UI mis à jour pour afficher les nouvelles données

### Documentation
- ✅ 4 nouveaux documents créés
- ✅ Exemples de requêtes API
- ✅ Schémas de flux de données

---

## 🎯 Prochaines Étapes Suggérées

1. **Amélioration de l'UI**
   - Ajouter des animations pour les faux positifs
   - Améliorer le design des consignes IA
   - Ajouter des tooltips explicatifs

2. **Fonctionnalités Avancées**
   - Permettre de supprimer un faux positif
   - Permettre de modifier une consigne IA
   - Ajouter un historique des modifications

3. **Analytics**
   - Tracker le nombre de faux positifs par rapport
   - Analyser les types de consignes les plus fréquentes
   - Améliorer l'IA en fonction des retours

---

**Date de création :** 2025-11-25  
**Dernière mise à jour :** 2025-11-25

