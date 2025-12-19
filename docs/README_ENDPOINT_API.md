# 🚀 Endpoint API Universel - Guide Complet

## 📋 Résumé Exécutif

Ce document présente la conception complète d'un **endpoint API universel** pour gérer toutes les interactions utilisateur qui créent ou modifient des données dans l'application de rapport Check Easy.

### 🎯 Objectif

Remplacer le stockage localStorage par un endpoint Bubble.io unique (`endpointrapportform`) qui centralise toutes les actions utilisateur.

---

## 📊 Résultats de l'Analyse

### ✅ Interactions Identifiées : **8 types d'actions**

| # | Action | Fichier Source | Ligne |
|---|--------|---------------|-------|
| 1 | Créer un signalement | `RapportPieceDetail.tsx` | 126-146 |
| 2 | Ajouter consigne IA | `RapportPieceDetail.tsx` | 147-179 |
| 3 | Modifier consigne IA | `RapportPieceDetail.tsx` | 180-193 |
| 4 | Supprimer consigne IA | `RapportPieceDetail.tsx` | 194-200 |
| 5 | Marquer faux positif | `RapportPieceDetail.tsx` | 209-224 |
| 6 | Changer statut signalement | `RemarquesGenerales.tsx` | 276-285 |
| 7 | Sélectionner photo référence | `ModifierPhotosDialog.tsx` | 39-51 |
| 8 | Supprimer photo | `ModifierPhotosDialog.tsx` | 53-68 |

---

## 📁 Fichiers Créés

### 1. Documentation

- **`API_ENDPOINT_UNIVERSEL.md`** : Documentation complète de l'API
  - Structure JSON détaillée
  - Types d'actions avec exemples
  - Commandes cURL de test
  - Gestion des erreurs
  - Sécurité et validation

- **`INTERACTIONS_MAPPING.md`** : Mapping détaillé des interactions
  - Tableau récapitulatif
  - Détails par interaction
  - Guide de migration localStorage → API

- **`README_ENDPOINT_API.md`** : Ce fichier (guide complet)

### 2. Code TypeScript

- **`src/types/endpoint.types.ts`** : Types TypeScript
  - Définition de tous les types d'actions
  - Interfaces pour les requêtes/réponses
  - Helpers pour construire les actions

- **`src/services/endpointRapportFormService.ts`** : Service API
  - Méthodes pour chaque type d'action
  - Gestion des erreurs
  - Logging

### 3. Scripts de Test

- **`test-endpoint.sh`** : Script bash pour tester l'endpoint
  - Tests individuels par action
  - Test batch (actions multiples)
  - Affichage coloré des résultats

- **`test-payload.json`** : Payload JSON de test
  - Exemple complet avec 3 actions
  - Prêt à utiliser avec cURL

---

## 🏗️ Structure JSON de l'Endpoint

### Requête

```json
{
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
        "commentaire": "Grande tache marron",
        "photoUrl": "https://example.com/photo.jpg",
        "photoBase64": null
      }
    }
  ]
}
```

### Réponse

```json
{
  "status": "success",
  "message": "Actions traitées avec succès",
  "rapportId": "1763649940640x234834439216168540",
  "processedActions": 1,
  "results": [
    {
      "actionType": "CREATE_SIGNALEMENT",
      "status": "success",
      "signalementId": "new_sig_456"
    }
  ],
  "errors": []
}
```

---

## 🧪 Tester l'Endpoint

### Avec PowerShell (Windows)

```powershell
$body = Get-Content 'docs/test-payload.json' -Raw
Invoke-WebRequest `
  -Uri 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/endpointrapportform/initialize' `
  -Method POST `
  -ContentType 'application/json' `
  -Body $body `
  -UseBasicParsing
```

### Avec cURL (Linux/Mac)

```bash
curl -X POST \
  'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/endpointrapportform/initialize' \
  -H 'Content-Type: application/json' \
  -d @docs/test-payload.json
```

### Avec le Script de Test

```bash
# Rendre le script exécutable
chmod +x docs/test-endpoint.sh

# Tester une action spécifique
./docs/test-endpoint.sh signalement

# Tester toutes les actions
./docs/test-endpoint.sh all
```

---

## 🔧 Utilisation dans le Code React

### Import du Service

```typescript
import { endpointRapportFormService } from '@/services/endpointRapportFormService';
```

### Exemple : Créer un Signalement

```typescript
const handleCreerSignalement = async () => {
  try {
    const response = await endpointRapportFormService.createSignalement(
      rapportId,
      userId,
      {
        piece: "Salon",
        probleme: "Tache sur le canapé",
        commentaire: "Grande tache marron",
        photoUrl: photoUrl,
        photoBase64: null
      }
    );
    
    if (response.status === 'success') {
      toast({ 
        title: "Signalement créé",
        description: "Le signalement a été enregistré avec succès"
      });
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

### Exemple : Actions Multiples (Batch)

```typescript
const handleSaveMultipleActions = async () => {
  const actions = [
    {
      actionType: 'CREATE_SIGNALEMENT',
      data: { piece: "Salon", probleme: "...", ... }
    },
    {
      actionType: 'CREATE_CONSIGNE_IA',
      data: { piece: "Cuisine", consigne: "...", ... }
    }
  ];

  const response = await endpointRapportFormService.sendActions(
    rapportId,
    userId,
    actions
  );
};
```

---

## 📝 Prochaines Étapes

### 1. Côté Bubble.io

- [ ] Créer le workflow `endpointrapportform`
- [ ] Implémenter la logique pour chaque type d'action
- [ ] Ajouter les validations de sécurité
- [ ] Tester avec les payloads fournis

### 2. Côté Frontend React

- [ ] Migrer les handlers de `RapportPieceDetail.tsx`
- [ ] Migrer les handlers de `RemarquesGenerales.tsx`
- [ ] Migrer les handlers de `ModifierPhotosDialog.tsx`
- [ ] Ajouter la gestion d'erreurs
- [ ] Implémenter le système de retry
- [ ] Ajouter un cache offline (optionnel)

### 3. Tests

- [ ] Tester chaque type d'action individuellement
- [ ] Tester les actions multiples (batch)
- [ ] Tester la gestion d'erreurs
- [ ] Tester les cas limites (IDs invalides, etc.)

---

## 🎯 Avantages de cette Architecture

✅ **Centralisation** : Un seul endpoint pour toutes les actions  
✅ **Type-safe** : Types TypeScript complets  
✅ **Batch processing** : Plusieurs actions en une requête  
✅ **Extensible** : Facile d'ajouter de nouveaux types d'actions  
✅ **Traçabilité** : Toutes les actions sont loggées  
✅ **Testable** : Scripts de test fournis  

---

## 📞 Support

Pour toute question ou problème :
1. Consulter `API_ENDPOINT_UNIVERSEL.md` pour les détails techniques
2. Consulter `INTERACTIONS_MAPPING.md` pour le mapping des interactions
3. Utiliser les scripts de test pour valider l'endpoint

---

**Dernière mise à jour** : 2025-11-21  
**Version** : 1.0.0  
**Auteur** : Augment Agent

