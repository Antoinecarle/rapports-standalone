# 🏗️ Architecture de l'Endpoint API Universel

## 📊 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION REACT                            │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │ RapportPiece     │  │ Remarques        │  │ ModifierPhotos│ │
│  │ Detail.tsx       │  │ Generales.tsx    │  │ Dialog.tsx    │ │
│  │                  │  │                  │  │               │ │
│  │ • Signalement    │  │ • Changer statut │  │ • Sélectionner│ │
│  │ • Consigne IA    │  │   signalement    │  │   photo       │ │
│  │ • Faux positif   │  │                  │  │ • Supprimer   │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘ │
│           │                     │                     │         │
│           └─────────────────────┼─────────────────────┘         │
│                                 │                               │
│                    ┌────────────▼────────────┐                  │
│                    │ endpointRapportForm     │                  │
│                    │ Service.ts              │                  │
│                    │                         │                  │
│                    │ • createSignalement()   │                  │
│                    │ • createConsigneIA()    │                  │
│                    │ • updateConsigneIA()    │                  │
│                    │ • deleteConsigneIA()    │                  │
│                    │ • markFalsePositive()   │                  │
│                    │ • updateSignalement()   │                  │
│                    │ • selectPhoto()         │                  │
│                    │ • deletePhoto()         │                  │
│                    └────────────┬────────────┘                  │
│                                 │                               │
└─────────────────────────────────┼───────────────────────────────┘
                                  │
                                  │ HTTPS POST
                                  │ JSON Payload
                                  │
                    ┌─────────────▼─────────────┐
                    │   BUBBLE.IO ENDPOINT      │
                    │                           │
                    │ /api/1.1/wf/              │
                    │ endpointrapportform/      │
                    │ initialize                │
                    │                           │
                    │ ┌───────────────────────┐ │
                    │ │ Validation            │ │
                    │ │ • rapportId exists    │ │
                    │ │ • User has rights     │ │
                    │ │ • Actions valid       │ │
                    │ └───────────────────────┘ │
                    │                           │
                    │ ┌───────────────────────┐ │
                    │ │ Process Actions       │ │
                    │ │ • Loop through actions│ │
                    │ │ • Switch on actionType│ │
                    │ │ • Execute logic       │ │
                    │ │ • Collect results     │ │
                    │ └───────────────────────┘ │
                    │                           │
                    │ ┌───────────────────────┐ │
                    │ │ Database Operations   │ │
                    │ │ • Create Signalement  │ │
                    │ │ • Create ConsigneIA   │ │
                    │ │ • Update/Delete       │ │
                    │ │ • Mark FauxPositif    │ │
                    │ └───────────────────────┘ │
                    │                           │
                    │ ┌───────────────────────┐ │
                    │ │ Response              │ │
                    │ │ • status              │ │
                    │ │ • results[]           │ │
                    │ │ • errors[]            │ │
                    │ └───────────────────────┘ │
                    └───────────────────────────┘
```

---

## 🔄 Flux de Données

### 1. Interaction Utilisateur

```
Utilisateur clique sur "Créer un signalement"
    ↓
Handler React (handleCreerSignalement)
    ↓
Collecte des données du formulaire
    ↓
Appel au service endpointRapportFormService
```

### 2. Préparation de la Requête

```
endpointRapportFormService.createSignalement()
    ↓
Construction du payload JSON
    {
      rapportId: "...",
      userId: "...",
      actions: [
        {
          actionType: "CREATE_SIGNALEMENT",
          data: { piece, probleme, commentaire, photo }
        }
      ]
    }
    ↓
Envoi HTTPS POST vers Bubble
```

### 3. Traitement Bubble

```
Réception de la requête
    ↓
Validation des paramètres
    ↓
Vérification des droits utilisateur
    ↓
Boucle sur les actions
    ↓
Pour chaque action:
    - Identifier le type (actionType)
    - Exécuter la logique correspondante
    - Créer/Modifier/Supprimer dans la DB
    - Ajouter le résultat à results[]
    - En cas d'erreur, ajouter à errors[]
    ↓
Construction de la réponse
    ↓
Retour JSON au frontend
```

### 4. Traitement de la Réponse

```
Réception de la réponse
    ↓
Vérification du status
    ↓
Si success:
    - Afficher toast de succès
    - Mettre à jour l'UI
    - Recharger les données si nécessaire
    ↓
Si error:
    - Afficher toast d'erreur
    - Logger l'erreur
    - Proposer un retry
```

---

## 📦 Types d'Actions Supportées

| Action Type | Opération DB | Retour |
|-------------|--------------|--------|
| `CREATE_SIGNALEMENT` | Create Signalement | signalementId |
| `CREATE_CONSIGNE_IA` | Create ConsigneIA | consigneId |
| `UPDATE_CONSIGNE_IA` | Update ConsigneIA | - |
| `DELETE_CONSIGNE_IA` | Delete ConsigneIA | - |
| `MARK_FALSE_POSITIVE` | Create FauxPositif | - |
| `UPDATE_SIGNALEMENT_STATUS` | Update Signalement | - |
| `SELECT_PHOTO_REFERENCE` | Update Piece | - |
| `DELETE_PHOTO` | Delete Photo | - |

---

## 🔐 Sécurité

### Validations Côté Frontend

```typescript
// Avant d'envoyer la requête
if (!rapportId || !userId) {
  throw new Error('Paramètres manquants');
}

if (actions.length === 0) {
  throw new Error('Aucune action à traiter');
}

if (actions.length > 50) {
  throw new Error('Trop d\'actions (max 50)');
}
```

### Validations Côté Backend (Bubble)

```
1. Vérifier que rapportId existe dans la DB
2. Vérifier que userId a les droits sur ce rapport
3. Valider le format de chaque action
4. Vérifier que les IDs référencés existent
5. Limiter le nombre d'actions (max 50)
6. Valider les types de données
```

---

## 📈 Avantages de cette Architecture

### ✅ Centralisation
- Un seul endpoint pour toutes les actions
- Simplifie la gestion des API
- Facilite la maintenance

### ✅ Batch Processing
- Plusieurs actions en une seule requête
- Réduit le nombre d'appels réseau
- Améliore les performances

### ✅ Type Safety
- Types TypeScript complets
- Validation à la compilation
- Moins d'erreurs runtime

### ✅ Extensibilité
- Facile d'ajouter de nouveaux types d'actions
- Structure modulaire
- Pas besoin de créer de nouveaux endpoints

### ✅ Traçabilité
- Toutes les actions sont loggées
- Timestamp pour chaque requête
- Facilite le debugging

---

## 🚀 Migration Progressive

### Phase 1 : Préparation
- [x] Analyser les interactions existantes
- [x] Créer les types TypeScript
- [x] Créer le service API
- [x] Documenter l'architecture

### Phase 2 : Implémentation Backend
- [ ] Créer le workflow Bubble
- [ ] Implémenter la logique pour chaque action
- [ ] Ajouter les validations
- [ ] Tester avec cURL

### Phase 3 : Migration Frontend
- [ ] Migrer RapportPieceDetail.tsx
- [ ] Migrer RemarquesGenerales.tsx
- [ ] Migrer ModifierPhotosDialog.tsx
- [ ] Ajouter la gestion d'erreurs

### Phase 4 : Tests et Optimisation
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Optimisation des performances
- [ ] Monitoring et logging

---

**Dernière mise à jour** : 2025-11-21  
**Version** : 1.0.0

