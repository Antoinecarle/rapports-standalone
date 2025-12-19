# 🗺️ Mapping des Interactions Utilisateur

## 📊 Tableau Récapitulatif

| # | Interaction | Fichier | Ligne | Handler | Action Type | Données |
|---|------------|---------|-------|---------|-------------|---------|
| 1 | Créer un signalement | `RapportPieceDetail.tsx` | 126-146 | `handleCreerSignalement` | `CREATE_SIGNALEMENT` | piece, probleme, commentaire, photo |
| 2 | Ajouter consigne IA | `RapportPieceDetail.tsx` | 147-179 | `handleAjouterConsigneIA` | `CREATE_CONSIGNE_IA` | piece, probleme, consigne, type |
| 3 | Modifier consigne IA | `RapportPieceDetail.tsx` | 180-193 | `handleEditConsigne` | `UPDATE_CONSIGNE_IA` | consigneId, piece, consigne, type |
| 4 | Supprimer consigne IA | `RapportPieceDetail.tsx` | 194-200 | `handleDeleteConsigne` | `DELETE_CONSIGNE_IA` | consigneId, piece |
| 5 | Marquer faux positif | `RapportPieceDetail.tsx` | 209-224 | `handleMarquerCommeFaux` | `MARK_FALSE_POSITIVE` | piece, probleme |
| 6 | Changer statut signalement | `RemarquesGenerales.tsx` | 276-285 | `handleStatutChange` | `UPDATE_SIGNALEMENT_STATUS` | signalementId, statut |
| 7 | Sélectionner photo référence | `ModifierPhotosDialog.tsx` | 39-51 | `handlePhotoSelect` | `SELECT_PHOTO_REFERENCE` | pieceId, photoId |
| 8 | Supprimer photo | `ModifierPhotosDialog.tsx` | 53-68 | `handlePhotoDelete` | `DELETE_PHOTO` | pieceId, photoId |

---

## 🔍 Détails par Interaction

### 1. Créer un Signalement

**Contexte** : L'utilisateur détecte un problème et souhaite le signaler.

**Déclencheur** : 
- Menu contextuel sur un problème détecté par l'IA
- Bouton "Créer un signalement"

**Données collectées** :
```typescript
{
  piece: string;           // Ex: "Salon"
  probleme: string;        // Ex: "Tache sur le canapé"
  commentaire: string;     // Ex: "Grande tache marron"
  photoUrl: string | null; // URL de la photo
  photoBase64: string | null; // Photo en base64
}
```

**Stockage actuel** : `localStorage` (clé: `signalements`)

**Action API** : `CREATE_SIGNALEMENT`

---

### 2. Ajouter une Consigne IA

**Contexte** : L'utilisateur veut donner une instruction à l'IA pour les futurs rapports.

**Déclencheur** :
- Menu contextuel sur un problème
- Bouton "Ajouter aux consignes IA"
- Bouton "Ajouter" dans la section Consignes

**Données collectées** :
```typescript
{
  piece: string;           // Ex: "Cuisine"
  probleme: string | null; // Ex: "Évier sale" (optionnel)
  consigne: string;        // Ex: "Toujours vérifier l'évier"
  type: "ignorer" | "surveiller"; // Type de consigne
}
```

**Stockage actuel** : `localStorage` (clé: `consignesIA`)

**Action API** : `CREATE_CONSIGNE_IA`

---

### 3. Modifier une Consigne IA

**Contexte** : L'utilisateur veut modifier une consigne existante.

**Déclencheur** :
- Menu contextuel sur une consigne
- Bouton "Modifier"

**Données collectées** :
```typescript
{
  consigneId: string;      // ID de la consigne
  piece: string;           // Ex: "Chambre"
  consigne: string;        // Nouveau texte
  type: "ignorer" | "surveiller";
}
```

**Stockage actuel** : `localStorage` (modification in-place)

**Action API** : `UPDATE_CONSIGNE_IA`

---

### 4. Supprimer une Consigne IA

**Contexte** : L'utilisateur veut supprimer une consigne.

**Déclencheur** :
- Menu contextuel sur une consigne
- Bouton "Supprimer"

**Données collectées** :
```typescript
{
  consigneId: string;      // ID de la consigne
  piece: string;           // Ex: "Salle de bain"
}
```

**Stockage actuel** : `localStorage` (suppression)

**Action API** : `DELETE_CONSIGNE_IA`

---

### 5. Marquer comme Faux Positif

**Contexte** : L'IA a détecté un problème qui n'en est pas un.

**Déclencheur** :
- Menu contextuel sur un problème
- Bouton "Marquer comme faux"

**Données collectées** :
```typescript
{
  piece: string;           // Ex: "Salon"
  probleme: string;        // Ex: "Coussin déplacé"
}
```

**Stockage actuel** : `localStorage` (clé: `fauxPositifs`)

**Action API** : `MARK_FALSE_POSITIVE`

---

### 6. Changer le Statut d'un Signalement

**Contexte** : L'utilisateur marque un signalement comme traité ou résolu.

**Déclencheur** :
- Dropdown dans le tableau des signalements
- Section "Remarques Générales"

**Données collectées** :
```typescript
{
  signalementId: string;   // ID du signalement
  statut: "À traiter" | "Résolu";
}
```

**Stockage actuel** : État local React (`statutsTraitement`)

**Action API** : `UPDATE_SIGNALEMENT_STATUS`

---

### 7. Sélectionner une Photo de Référence

**Contexte** : L'utilisateur définit une nouvelle photo comme référence pour une pièce.

**Déclencheur** :
- Clic sur une photo dans le dialog "Modifier les photos"
- Menu contextuel "Définir comme référence"

**Données collectées** :
```typescript
{
  pieceId: string;         // Ex: "piece_salon"
  photoId: string;         // Ex: "photo_456"
}
```

**Stockage actuel** : État local React (props `pieces`)

**Action API** : `SELECT_PHOTO_REFERENCE`

---

### 8. Supprimer une Photo

**Contexte** : L'utilisateur supprime une photo d'une pièce.

**Déclencheur** :
- Menu contextuel sur une photo
- Bouton "Supprimer"

**Données collectées** :
```typescript
{
  pieceId: string;         // Ex: "piece_cuisine"
  photoId: string;         // Ex: "photo_789"
}
```

**Stockage actuel** : État local React (props `pieces`)

**Action API** : `DELETE_PHOTO`

---

## 🔄 Migration du LocalStorage vers l'API

### Étapes de Migration

1. **Remplacer les appels localStorage** par des appels à `endpointRapportFormService`
2. **Gérer les erreurs** et afficher des notifications appropriées
3. **Optimiser avec batch processing** pour les actions multiples
4. **Ajouter un système de retry** en cas d'échec réseau
5. **Implémenter un cache local** pour les actions en attente (offline-first)

### Exemple de Migration

**Avant** (localStorage) :
```typescript
const handleCreerSignalement = () => {
  const signalement = { piece, probleme, commentaire, photo, date };
  const signalementsExistants = JSON.parse(localStorage.getItem('signalements') || '[]');
  signalementsExistants.push(signalement);
  localStorage.setItem('signalements', JSON.stringify(signalementsExistants));
  toast({ title: "Signalement créé" });
};
```

**Après** (API) :
```typescript
const handleCreerSignalement = async () => {
  try {
    const response = await endpointRapportFormService.createSignalement(
      rapportId,
      userId,
      { piece, probleme, commentaire, photoUrl: photo, photoBase64: null }
    );
    
    if (response.status === 'success') {
      toast({ title: "Signalement créé avec succès" });
    } else {
      throw new Error(response.errors[0]?.error || 'Erreur inconnue');
    }
  } catch (error) {
    toast({ 
      title: "Erreur", 
      description: "Impossible de créer le signalement",
      variant: "destructive" 
    });
  }
};
```

---

## 📝 Prochaines Étapes

- [ ] Créer le workflow Bubble `endpointrapportform`
- [ ] Tester avec les scripts cURL
- [ ] Migrer les handlers React pour utiliser le service
- [ ] Ajouter la gestion d'erreurs et retry
- [ ] Implémenter le système de cache offline
- [ ] Ajouter les tests unitaires

---

**Dernière mise à jour** : 2025-11-21  
**Version** : 1.0.0

