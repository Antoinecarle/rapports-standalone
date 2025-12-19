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
  - `piece` : Nom de la pièce
  - `probleme` : Description du problème
  - `commentaire` : Commentaire de l'utilisateur
  - `photo` : URL de la photo (base64 ou URL)
  - `date` : Timestamp ISO

### 2️⃣ **Ajouter/Modifier une Consigne IA**
- **Fichier** : `src/components/rapport/RapportPieceDetail.tsx`
- **Ligne** : 147-179
- **Handler** : `handleAjouterConsigneIA`
- **Données** :
  - `piece` : Nom de la pièce
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
  - `piece` : Nom de la pièce

### 4️⃣ **Marquer comme Faux Positif**
- **Fichier** : `src/components/rapport/RapportPieceDetail.tsx`
- **Ligne** : 209-224
- **Handler** : `handleMarquerCommeFaux`
- **Données** :
  - `piece` : Nom de la pièce
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
        "piece": "Salon",
        "probleme": "Tache sur le canapé",
        "commentaire": "Grande tache marron sur le coussin gauche",
        "photoUrl": "https://example.com/photo.jpg",
        "photoBase64": null
      }
    },
    {
      "actionType": "CREATE_CONSIGNE_IA",
      "data": {
        "piece": "Cuisine",
        "probleme": "Évier sale",
        "consigne": "Toujours vérifier la propreté de l'évier",
        "type": "surveiller"
      }
    },
    {
      "actionType": "UPDATE_CONSIGNE_IA",
      "data": {
        "consigneId": "consigne_456",
        "piece": "Chambre",
        "consigne": "Ignorer les petites traces sur le miroir",
        "type": "ignorer"
      }
    },
    {
      "actionType": "DELETE_CONSIGNE_IA",
      "data": {
        "consigneId": "consigne_789",
        "piece": "Salle de bain"
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

## 📝 Suite dans le fichier suivant...

