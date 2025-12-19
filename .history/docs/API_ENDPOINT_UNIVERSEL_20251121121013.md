# 📡 Endpoint API Universel - Documentation Complète

## 🎯 Objectif

Créer un endpoint Bubble.io unique (`endpointrapportform`) qui gère toutes les interactions utilisateur modifiant ou créant des données dans l'application de rapport.

---

## 📋 Liste des Interactions Identifiées

### 1️⃣ **Créer un Signalement**
- **Fichier** : `src/components/rapport/RapportPieceDetail.tsx`
- **Ligne** : 126-146
- **Handler** : `handleCreerSignalement`
- **Données** :
  - `pieceId` : ID unique de la pièce (ex: "piece_salon_123")
  - `probleme` : Description du problème
  - `commentaire` : Commentaire de l'utilisateur
  - `photo` : URL de la photo (base64 ou URL)
  - `date` : Timestamp ISO

### 2️⃣ **Ajouter/Modifier une Consigne IA**
- **Fichier** : `src/components/rapport/RapportPieceDetail.tsx`
- **Ligne** : 147-179
- **Handler** : `handleAjouterConsigneIA`
- **Données** :
  - `pieceId` : ID unique de la pièce (ex: "piece_cuisine_456")
  - `probleme` : Description du problème (optionnel)
  - `consigne` : Texte de la consigne
  - `type` : "ignorer" | "surveiller"
  - `date` : Timestamp ISO
  - `editingIndex` : Index si modification (null si création)

### 3️⃣ **Supprimer une Consigne IA**
- **Fichier** : `src/components/rapport/RapportPieceDetail.tsx`
- **Ligne** : 194-200
- **Handler** : `handleDeleteConsigne`
- **Données** :
  - `index` : Index de la consigne à supprimer
  - `pieceId` : ID unique de la pièce (ex: "piece_chambre_789")

### 4️⃣ **Marquer comme Faux Positif**
- **Fichier** : `src/components/rapport/RapportPieceDetail.tsx`
- **Ligne** : 209-224
- **Handler** : `handleMarquerCommeFaux`
- **Données** :
  - `pieceId` : ID unique de la pièce (ex: "piece_salon_345")
  - `probleme` : Description du problème
  - `date` : Timestamp ISO

### 5️⃣ **Changer le Statut d'un Signalement**
- **Fichier** : `src/components/rapport/RemarquesGenerales.tsx`
- **Ligne** : 276-285
- **Handler** : `handleStatutChange`
- **Données** :
  - `index` : Index du signalement
  - `statut` : "À traiter" | "Résolu"

### 6️⃣ **Sélectionner une Photo de Référence**
- **Fichier** : `src/components/rapport/dialogs/ModifierPhotosDialog.tsx`
- **Ligne** : 39-51
- **Handler** : `handlePhotoSelect`
- **Données** :
  - `pieceId` : ID de la pièce
  - `photoId` : ID de la photo

### 7️⃣ **Supprimer une Photo**
- **Fichier** : `src/components/rapport/dialogs/ModifierPhotosDialog.tsx`
- **Ligne** : 53-68
- **Handler** : `handlePhotoDelete`
- **Données** :
  - `pieceId` : ID de la pièce
  - `photoId` : ID de la photo

### 8️⃣ **Sauvegarder les Modifications de Photos**
- **Fichier** : `src/components/rapport/dialogs/ModifierPhotosDialog.tsx`
- **Ligne** : 81-88
- **Handler** : `handleSave`
- **Données** :
  - `pieces` : Array de toutes les pièces avec leurs photos modifiées

---

## 🏗️ Structure JSON Unifiée

```json
{
  "rapportId": "1763649940640x234834439216168540",
  "version": "test",
  "timestamp": "2025-11-21T10:30:00.000Z",
  "userId": "user_123",
  "actions": [
    {
      "actionType": "CREATE_SIGNALEMENT",
      "data": {
        "pieceId": "piece_salon_123",
        "probleme": "Tache sur le canapé",
        "commentaire": "Grande tache marron sur le coussin gauche",
        "photoUrl": "https://example.com/photo.jpg",
        "photoBase64": null
      }
    },
    {
      "actionType": "CREATE_CONSIGNE_IA",
      "data": {
        "pieceId": "piece_cuisine_456",
        "probleme": "Évier sale",
        "consigne": "Toujours vérifier la propreté de l'évier",
        "type": "surveiller"
      }
    },
    {
      "actionType": "UPDATE_CONSIGNE_IA",
      "data": {
        "consigneId": "consigne_456",
        "pieceId": "piece_chambre_789",
        "consigne": "Ignorer les petites traces sur le miroir",
        "type": "ignorer"
      }
    },
    {
      "actionType": "DELETE_CONSIGNE_IA",
      "data": {
        "consigneId": "consigne_789",
        "pieceId": "piece_sdb_012"
      }
    },
    {
      "actionType": "MARK_FALSE_POSITIVE",
      "data": {
        "pieceId": "piece_salon_345",
        "probleme": "Coussin déplacé"
      }
    },
    {
      "actionType": "UPDATE_SIGNALEMENT_STATUS",
      "data": {
        "signalementId": "sig_123",
        "statut": "Résolu"
      }
    },
    {
      "actionType": "SELECT_PHOTO_REFERENCE",
      "data": {
        "pieceId": "piece_salon",
        "photoId": "photo_456"
      }
    },
    {
      "actionType": "DELETE_PHOTO",
      "data": {
        "pieceId": "piece_cuisine",
        "photoId": "photo_789"
      }
    }
  ]
}
```

---

## 🔧 Types d'Actions Détaillés

### `CREATE_SIGNALEMENT`
Créer un nouveau signalement pour un problème détecté.

**Champs requis** :
- `piece` (string) : Nom de la pièce
- `probleme` (string) : Description du problème
- `commentaire` (string) : Commentaire de l'utilisateur
- `photoUrl` (string | null) : URL de la photo
- `photoBase64` (string | null) : Photo en base64 (si upload direct)

**Exemple** :
```json
{
  "actionType": "CREATE_SIGNALEMENT",
  "data": {
    "piece": "Salon",
    "probleme": "Tache sur le canapé",
    "commentaire": "Grande tache marron visible",
    "photoUrl": "https://example.com/photo.jpg",
    "photoBase64": null
  }
}
```

---

### `CREATE_CONSIGNE_IA`
Ajouter une nouvelle consigne pour l'IA.

**Champs requis** :
- `piece` (string) : Nom de la pièce
- `probleme` (string | null) : Description du problème lié (optionnel)
- `consigne` (string) : Texte de la consigne
- `type` (string) : "ignorer" | "surveiller"

**Exemple** :
```json
{
  "actionType": "CREATE_CONSIGNE_IA",
  "data": {
    "piece": "Cuisine",
    "probleme": "Évier sale",
    "consigne": "Toujours vérifier la propreté de l'évier",
    "type": "surveiller"
  }
}
```

---

### `UPDATE_CONSIGNE_IA`
Modifier une consigne IA existante.

**Champs requis** :
- `consigneId` (string) : ID de la consigne à modifier
- `piece` (string) : Nom de la pièce
- `consigne` (string) : Nouveau texte de la consigne
- `type` (string) : "ignorer" | "surveiller"

**Exemple** :
```json
{
  "actionType": "UPDATE_CONSIGNE_IA",
  "data": {
    "consigneId": "consigne_456",
    "piece": "Chambre",
    "consigne": "Ignorer les petites traces sur le miroir",
    "type": "ignorer"
  }
}
```

---

### `DELETE_CONSIGNE_IA`
Supprimer une consigne IA.

**Champs requis** :
- `consigneId` (string) : ID de la consigne à supprimer
- `piece` (string) : Nom de la pièce

**Exemple** :
```json
{
  "actionType": "DELETE_CONSIGNE_IA",
  "data": {
    "consigneId": "consigne_789",
    "piece": "Salle de bain"
  }
}
```

---

### `MARK_FALSE_POSITIVE`
Marquer un problème détecté par l'IA comme faux positif.

**Champs requis** :
- `piece` (string) : Nom de la pièce
- `probleme` (string) : Description du problème

**Exemple** :
```json
{
  "actionType": "MARK_FALSE_POSITIVE",
  "data": {
    "piece": "Salon",
    "probleme": "Coussin déplacé"
  }
}
```

---

### `UPDATE_SIGNALEMENT_STATUS`
Changer le statut d'un signalement existant.

**Champs requis** :
- `signalementId` (string) : ID du signalement
- `statut` (string) : "À traiter" | "Résolu"

**Exemple** :
```json
{
  "actionType": "UPDATE_SIGNALEMENT_STATUS",
  "data": {
    "signalementId": "sig_123",
    "statut": "Résolu"
  }
}
```

---

### `SELECT_PHOTO_REFERENCE`
Définir une photo comme nouvelle référence pour une pièce.

**Champs requis** :
- `pieceId` (string) : ID de la pièce
- `photoId` (string) : ID de la photo

**Exemple** :
```json
{
  "actionType": "SELECT_PHOTO_REFERENCE",
  "data": {
    "pieceId": "piece_salon",
    "photoId": "photo_456"
  }
}
```

---

### `DELETE_PHOTO`
Supprimer une photo d'une pièce.

**Champs requis** :
- `pieceId` (string) : ID de la pièce
- `photoId` (string) : ID de la photo

**Exemple** :
```json
{
  "actionType": "DELETE_PHOTO",
  "data": {
    "pieceId": "piece_cuisine",
    "photoId": "photo_789"
  }
}
```

---

## 🧪 Commande cURL pour Tester l'Endpoint

### Test avec Toutes les Actions

```bash
curl -X POST \
  'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/endpointrapportform/initialize' \
  -H 'Content-Type: application/json' \
  -d '{
  "rapportId": "1763649940640x234834439216168540",
  "version": "test",
  "timestamp": "2025-11-21T10:30:00.000Z",
  "userId": "user_antoine_123",
  "actions": [
    {
      "actionType": "CREATE_SIGNALEMENT",
      "data": {
        "piece": "Salon",
        "probleme": "Tache sur le canapé",
        "commentaire": "Grande tache marron sur le coussin gauche",
        "photoUrl": "https://eb0bcaf95c312d7fe9372017cb5f1835.cdn.bubble.io/f1763650088185x167971974653885470/File.jpg",
        "photoBase64": null
      }
    },
    {
      "actionType": "CREATE_CONSIGNE_IA",
      "data": {
        "piece": "Cuisine",
        "probleme": "Évier sale",
        "consigne": "Toujours vérifier la propreté de l évier avant de valider",
        "type": "surveiller"
      }
    },
    {
      "actionType": "MARK_FALSE_POSITIVE",
      "data": {
        "piece": "Salon",
        "probleme": "Coussin déplacé"
      }
    },
    {
      "actionType": "UPDATE_SIGNALEMENT_STATUS",
      "data": {
        "signalementId": "existing_sig_123",
        "statut": "Résolu"
      }
    }
  ]
}'
```

### Test Minimal (Une Seule Action)

```bash
curl -X POST \
  'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/endpointrapportform/initialize' \
  -H 'Content-Type: application/json' \
  -d '{
  "rapportId": "1763649940640x234834439216168540",
  "version": "test",
  "timestamp": "2025-11-21T10:30:00.000Z",
  "userId": "user_antoine_123",
  "actions": [
    {
      "actionType": "CREATE_SIGNALEMENT",
      "data": {
        "piece": "Salon",
        "probleme": "Test de signalement",
        "commentaire": "Ceci est un test",
        "photoUrl": null,
        "photoBase64": null
      }
    }
  ]
}'
```

---

## 📊 Réponse Attendue de l'API

```json
{
  "status": "success",
  "message": "Actions traitées avec succès",
  "rapportId": "1763649940640x234834439216168540",
  "processedActions": 4,
  "results": [
    {
      "actionType": "CREATE_SIGNALEMENT",
      "status": "success",
      "signalementId": "new_sig_456"
    },
    {
      "actionType": "CREATE_CONSIGNE_IA",
      "status": "success",
      "consigneId": "new_consigne_789"
    },
    {
      "actionType": "MARK_FALSE_POSITIVE",
      "status": "success"
    },
    {
      "actionType": "UPDATE_SIGNALEMENT_STATUS",
      "status": "success"
    }
  ],
  "errors": []
}
```

---

## 🔐 Sécurité et Validation

### Validations Côté Backend (Bubble)

1. **Vérifier que le `rapportId` existe**
2. **Vérifier que l'utilisateur a les droits** sur ce rapport
3. **Valider le format de chaque action** selon son type
4. **Vérifier que les IDs référencés existent** (consigneId, signalementId, etc.)
5. **Limiter le nombre d'actions par requête** (max 50 actions)

### Gestion des Erreurs

```json
{
  "status": "partial_success",
  "message": "Certaines actions ont échoué",
  "rapportId": "1763649940640x234834439216168540",
  "processedActions": 2,
  "results": [
    {
      "actionType": "CREATE_SIGNALEMENT",
      "status": "success",
      "signalementId": "new_sig_456"
    },
    {
      "actionType": "DELETE_CONSIGNE_IA",
      "status": "error",
      "error": "Consigne introuvable"
    }
  ],
  "errors": [
    {
      "actionIndex": 1,
      "actionType": "DELETE_CONSIGNE_IA",
      "error": "Consigne introuvable"
    }
  ]
}
```

---

## 📝 Prochaines Étapes

1. ✅ **Documentation complète** des interactions
2. ⏳ **Créer le workflow Bubble** `endpointrapportform`
3. ⏳ **Implémenter la logique de traitement** pour chaque type d'action
4. ⏳ **Tester avec cURL** et valider les réponses
5. ⏳ **Intégrer dans le frontend React** pour remplacer localStorage
6. ⏳ **Ajouter la gestion d'erreurs** et les notifications utilisateur

---

## 🎯 Avantages de cette Architecture

✅ **Endpoint unique** : Simplifie la gestion des API
✅ **Extensible** : Facile d'ajouter de nouveaux types d'actions
✅ **Batch processing** : Plusieurs actions en une seule requête
✅ **Traçabilité** : Toutes les actions sont loggées avec timestamp
✅ **Atomicité** : Possibilité de rollback en cas d'erreur
✅ **Type-safe** : Structure JSON claire et validée

---

**Dernière mise à jour** : 2025-11-21
**Version** : 1.0.0

