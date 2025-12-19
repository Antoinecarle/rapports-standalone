# ✅ Changement : `piece` → `pieceId`

## 📋 Résumé

Le champ `piece` dans toutes les actions de l'API a été renommé en `pieceId` pour clarifier qu'il s'agit de l'**ID unique de la pièce** et non du nom de la pièce.

---

## 🔄 Changements Effectués

### 1. Types TypeScript

**Fichier** : `src/types/endpoint.types.ts`

**Avant** :
```typescript
export interface CreateSignalementData {
  piece: string; // Ambigu : nom ou ID ?
  probleme: string;
  ...
}
```

**Après** :
```typescript
export interface CreateSignalementData {
  pieceId: string; // ID unique de la pièce (ex: "piece_salon_123")
  probleme: string;
  ...
}
```

**Interfaces modifiées** :
- ✅ `CreateSignalementData`
- ✅ `CreateConsigneIAData`
- ✅ `UpdateConsigneIAData`
- ✅ `DeleteConsigneIAData`
- ✅ `MarkFalsePositiveData`

---

### 2. Documentation

**Fichiers mis à jour** :
- ✅ `docs/API_ENDPOINT_UNIVERSEL.md` (partiellement)
- ✅ `docs/test-payload.json`

---

## 📝 Exemples Mis à Jour

### CREATE_SIGNALEMENT

**Avant** :
```json
{
  "actionType": "CREATE_SIGNALEMENT",
  "data": {
    "piece": "Salon",  // ❌ Nom de la pièce
    "probleme": "Tache sur le canapé",
    ...
  }
}
```

**Après** :
```json
{
  "actionType": "CREATE_SIGNALEMENT",
  "data": {
    "pieceId": "piece_salon_123",  // ✅ ID unique de la pièce
    "probleme": "Tache sur le canapé",
    ...
  }
}
```

### CREATE_CONSIGNE_IA

**Avant** :
```json
{
  "actionType": "CREATE_CONSIGNE_IA",
  "data": {
    "piece": "Cuisine",  // ❌ Nom de la pièce
    "consigne": "Vérifier l'évier",
    ...
  }
}
```

**Après** :
```json
{
  "actionType": "CREATE_CONSIGNE_IA",
  "data": {
    "pieceId": "piece_cuisine_456",  // ✅ ID unique de la pièce
    "consigne": "Vérifier l'évier",
    ...
  }
}
```

### MARK_FALSE_POSITIVE

**Avant** :
```json
{
  "actionType": "MARK_FALSE_POSITIVE",
  "data": {
    "piece": "Salon",  // ❌ Nom de la pièce
    "probleme": "Coussin déplacé"
  }
}
```

**Après** :
```json
{
  "actionType": "MARK_FALSE_POSITIVE",
  "data": {
    "pieceId": "piece_salon_345",  // ✅ ID unique de la pièce
    "probleme": "Coussin déplacé"
  }
}
```

---

## 🔧 Impact sur le Code React

### Avant (avec nom de pièce)

```typescript
const handleCreerSignalement = async () => {
  await endpointRapportFormService.createSignalement(
    rapportId,
    userId,
    {
      piece: piece.nom,  // ❌ Nom de la pièce
      probleme: "Tache",
      commentaire: "...",
      photoUrl: null,
      photoBase64: null
    }
  );
};
```

### Après (avec ID de pièce)

```typescript
const handleCreerSignalement = async () => {
  await endpointRapportFormService.createSignalement(
    rapportId,
    userId,
    {
      pieceId: piece.id,  // ✅ ID unique de la pièce
      probleme: "Tache",
      commentaire: "...",
      photoUrl: null,
      photoBase64: null
    }
  );
};
```

---

## 📊 Mapping des IDs de Pièces

### Format des IDs

Les IDs de pièces doivent suivre le format :
```
piece_{nom}_{timestamp_ou_index}
```

**Exemples** :
- `piece_salon_123`
- `piece_cuisine_456`
- `piece_chambre_789`
- `piece_sdb_012` (salle de bain)

### Où Trouver l'ID de la Pièce ?

Dans les composants React, l'ID de la pièce est disponible dans :

```typescript
// Dans RapportPieceDetail.tsx
interface PieceData {
  id: string;          // ✅ Utiliser ceci
  nom: string;         // ❌ Ne pas utiliser
  problemes: Probleme[];
  ...
}

// Utilisation
const piece: PieceData = {...};
const pieceId = piece.id;  // ✅ Correct
```

---

## ✅ Checklist de Migration

### Backend (Bubble.io)

- [ ] Mettre à jour le workflow pour recevoir `pieceId` au lieu de `piece`
- [ ] Vérifier que les champs de la base de données utilisent des IDs
- [ ] Tester avec les nouveaux payloads JSON

### Frontend (React)

- [ ] Modifier `handleCreerSignalement` pour envoyer `piece.id` au lieu de `piece.nom`
- [ ] Modifier `handleAjouterConsigneIA` pour envoyer `piece.id`
- [ ] Modifier `handleMarquerCommeFaux` pour envoyer `piece.id`
- [ ] Modifier `handleDeleteConsigne` pour envoyer `piece.id`
- [ ] Vérifier que tous les composants ont accès à `piece.id`

### Tests

- [ ] Mettre à jour les tests avec les nouveaux IDs
- [ ] Tester avec `test-payload.json` mis à jour
- [ ] Vérifier que l'API Bubble accepte les nouveaux payloads

---

## 🎯 Avantages de ce Changement

✅ **Clarté** : Plus d'ambiguïté entre nom et ID  
✅ **Unicité** : Les IDs sont uniques, les noms peuvent être dupliqués  
✅ **Robustesse** : Fonctionne même si le nom de la pièce change  
✅ **Traçabilité** : Facilite le suivi des pièces dans la base de données  
✅ **Internationalisation** : Les IDs ne dépendent pas de la langue  

---

**Dernière mise à jour** : 2025-11-21  
**Version** : 1.1.0

