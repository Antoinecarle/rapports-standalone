# 🔧 Guide d'Implémentation du Workflow Bubble

## 📋 Configuration de l'Endpoint

### Nom du Workflow
`endpointrapportform`

### URL Complète
```
https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/endpointrapportform/initialize
```

### Méthode HTTP
`POST`

### Type de Données
`application/json`

---

## 🏗️ Structure du Workflow Bubble

### 1. Paramètres d'Entrée (Request Body)

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `rapportId` | text | ✅ | ID du rapport |
| `version` | text | ✅ | "test" ou "live" |
| `timestamp` | text | ✅ | ISO 8601 timestamp |
| `userId` | text | ✅ | ID de l'utilisateur |
| `actions` | list | ✅ | Liste des actions à traiter |

### 2. Structure d'une Action

Chaque élément de `actions` contient :
- `actionType` (text) : Type d'action
- `data` (object) : Données spécifiques à l'action

---

## 🔄 Logique du Workflow

### Étape 1 : Validation Initiale

```
Condition: rapportId is not empty
AND userId is not empty
AND actions:count > 0
AND actions:count <= 50
```

**Si validation échoue** :
```json
{
  "status": "error",
  "message": "Paramètres invalides",
  "rapportId": "",
  "processedActions": 0,
  "results": [],
  "errors": [
    {
      "actionIndex": -1,
      "actionType": "",
      "error": "Paramètres manquants ou invalides"
    }
  ]
}
```

### Étape 2 : Vérifier les Droits Utilisateur

```
Search for Rapports
  Constraints:
    - _id = rapportId
    - Created By = userId (ou autre logique de permissions)
```

**Si rapport non trouvé ou pas de droits** :
```json
{
  "status": "error",
  "message": "Accès refusé",
  ...
}
```

### Étape 3 : Boucle sur les Actions

Pour chaque action dans `actions` :

```
1. Lire actionType
2. Switch sur actionType:
   - CREATE_SIGNALEMENT → Créer un signalement
   - CREATE_CONSIGNE_IA → Créer une consigne
   - UPDATE_CONSIGNE_IA → Modifier une consigne
   - DELETE_CONSIGNE_IA → Supprimer une consigne
   - MARK_FALSE_POSITIVE → Marquer faux positif
   - UPDATE_SIGNALEMENT_STATUS → Changer statut
   - SELECT_PHOTO_REFERENCE → Sélectionner photo
   - DELETE_PHOTO → Supprimer photo
3. Ajouter le résultat à la liste results
4. En cas d'erreur, ajouter à la liste errors
```

---

## 📝 Implémentation par Type d'Action

### CREATE_SIGNALEMENT

**Données reçues** :
```json
{
  "piece": "Salon",
  "probleme": "Tache sur le canapé",
  "commentaire": "Grande tache marron",
  "photoUrl": "https://...",
  "photoBase64": null
}
```

**Actions Bubble** :
1. Créer un nouveau `Signalement`
2. Définir les champs :
   - `rapport` = Search for Rapports (id = rapportId)
   - `piece` = data.piece
   - `probleme` = data.probleme
   - `commentaire` = data.commentaire
   - `photo_url` = data.photoUrl
   - `created_by` = userId
   - `created_at` = Current date/time
   - `statut` = "À traiter"
3. Retourner :
```json
{
  "actionType": "CREATE_SIGNALEMENT",
  "status": "success",
  "signalementId": "Result of Step X's _id"
}
```

---

### CREATE_CONSIGNE_IA

**Données reçues** :
```json
{
  "piece": "Cuisine",
  "probleme": "Évier sale",
  "consigne": "Toujours vérifier...",
  "type": "surveiller"
}
```

**Actions Bubble** :
1. Créer une nouvelle `ConsigneIA`
2. Définir les champs :
   - `rapport` = Search for Rapports (id = rapportId)
   - `piece` = data.piece
   - `probleme` = data.probleme
   - `consigne` = data.consigne
   - `type` = data.type
   - `created_by` = userId
   - `created_at` = Current date/time
3. Retourner :
```json
{
  "actionType": "CREATE_CONSIGNE_IA",
  "status": "success",
  "consigneId": "Result of Step X's _id"
}
```

---

### UPDATE_CONSIGNE_IA

**Données reçues** :
```json
{
  "consigneId": "consigne_456",
  "piece": "Chambre",
  "consigne": "Nouveau texte",
  "type": "ignorer"
}
```

**Actions Bubble** :
1. Search for ConsigneIA (id = data.consigneId)
2. Vérifier que la consigne existe et appartient au rapport
3. Make changes to ConsigneIA :
   - `consigne` = data.consigne
   - `type` = data.type
   - `updated_at` = Current date/time
4. Retourner :
```json
{
  "actionType": "UPDATE_CONSIGNE_IA",
  "status": "success"
}
```

---

### DELETE_CONSIGNE_IA

**Données reçues** :
```json
{
  "consigneId": "consigne_789",
  "piece": "Salle de bain"
}
```

**Actions Bubble** :
1. Search for ConsigneIA (id = data.consigneId)
2. Vérifier que la consigne existe et appartient au rapport
3. Delete ConsigneIA
4. Retourner :
```json
{
  "actionType": "DELETE_CONSIGNE_IA",
  "status": "success"
}
```

---

### MARK_FALSE_POSITIVE

**Données reçues** :
```json
{
  "piece": "Salon",
  "probleme": "Coussin déplacé"
}
```

**Actions Bubble** :
1. Créer un nouveau `FauxPositif`
2. Définir les champs :
   - `rapport` = Search for Rapports (id = rapportId)
   - `piece` = data.piece
   - `probleme` = data.probleme
   - `created_by` = userId
   - `created_at` = Current date/time
3. Optionnel : Mettre à jour l'IA pour ignorer ce type de problème
4. Retourner :
```json
{
  "actionType": "MARK_FALSE_POSITIVE",
  "status": "success"
}
```

---

### UPDATE_SIGNALEMENT_STATUS

**Données reçues** :
```json
{
  "signalementId": "sig_123",
  "statut": "Résolu"
}
```

**Actions Bubble** :
1. Search for Signalement (id = data.signalementId)
2. Vérifier que le signalement existe et appartient au rapport
3. Make changes to Signalement :
   - `statut` = data.statut
   - `updated_at` = Current date/time
4. Retourner :
```json
{
  "actionType": "UPDATE_SIGNALEMENT_STATUS",
  "status": "success"
}
```

---

### SELECT_PHOTO_REFERENCE

**Données reçues** :
```json
{
  "pieceId": "piece_salon",
  "photoId": "photo_456"
}
```

**Actions Bubble** :
1. Search for Piece (id = data.pieceId)
2. Search for Photo (id = data.photoId)
3. Vérifier que la photo appartient à la pièce
4. Make changes to Piece :
   - `photo_reference_active` = data.photoId
   - `updated_at` = Current date/time
5. Retourner :
```json
{
  "actionType": "SELECT_PHOTO_REFERENCE",
  "status": "success"
}
```

---

### DELETE_PHOTO

**Données reçues** :
```json
{
  "pieceId": "piece_cuisine",
  "photoId": "photo_789"
}
```

**Actions Bubble** :
1. Search for Photo (id = data.photoId)
2. Vérifier que la photo appartient à la pièce
3. Delete Photo
4. Retourner :
```json
{
  "actionType": "DELETE_PHOTO",
  "status": "success"
}
```

---

## 🔐 Sécurité et Validation

### Validations à Implémenter

1. **Vérifier que le rapport existe**
2. **Vérifier les droits de l'utilisateur** sur le rapport
3. **Valider le format des données** pour chaque action
4. **Limiter le nombre d'actions** (max 50 par requête)
5. **Vérifier que les IDs référencés existent** (consigneId, signalementId, etc.)
6. **Empêcher les injections** et valider les types de données

### Gestion des Erreurs

Pour chaque action, utiliser un bloc Try/Catch :
- **Success** : Ajouter à `results` avec status "success"
- **Error** : Ajouter à `errors` avec le message d'erreur

---

## 📊 Réponse Finale

### Structure de la Réponse

```json
{
  "status": "success" | "partial_success" | "error",
  "message": "Description du résultat",
  "rapportId": "1763649940640x234834439216168540",
  "processedActions": 3,
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
    }
  ],
  "errors": [
    {
      "actionIndex": 2,
      "actionType": "DELETE_CONSIGNE_IA",
      "error": "Consigne introuvable"
    }
  ]
}
```

### Déterminer le Status Global

- **"success"** : Toutes les actions ont réussi (errors.length = 0)
- **"partial_success"** : Certaines actions ont échoué (0 < errors.length < actions.length)
- **"error"** : Toutes les actions ont échoué ou erreur de validation initiale

---

## 🧪 Tests Recommandés

1. **Test avec une seule action** de chaque type
2. **Test avec actions multiples** (batch)
3. **Test avec ID invalide** (doit retourner erreur)
4. **Test avec utilisateur non autorisé** (doit refuser)
5. **Test avec trop d'actions** (> 50, doit refuser)
6. **Test avec données manquantes** (doit retourner erreur)

---

**Dernière mise à jour** : 2025-11-21  
**Version** : 1.0.0

