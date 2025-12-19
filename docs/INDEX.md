# 📚 Documentation - Endpoint API Universel

## 🎯 Vue d'Ensemble

Cette documentation présente la conception complète d'un **endpoint API universel** pour gérer toutes les interactions utilisateur dans l'application de rapport Check Easy.

---

## 📖 Guide de Lecture

### 🚀 Pour Démarrer Rapidement

1. **[README_ENDPOINT_API.md](./README_ENDPOINT_API.md)** - Guide complet et résumé exécutif
   - Vue d'ensemble du projet
   - Liste des interactions identifiées
   - Fichiers créés
   - Commandes de test
   - Prochaines étapes

### 📋 Documentation Détaillée

2. **[API_ENDPOINT_UNIVERSEL.md](./API_ENDPOINT_UNIVERSEL.md)** - Documentation technique complète
   - Structure JSON détaillée
   - Types d'actions avec exemples
   - Commandes cURL de test
   - Gestion des erreurs
   - Sécurité et validation
   - Réponses attendues

3. **[INTERACTIONS_MAPPING.md](./INTERACTIONS_MAPPING.md)** - Mapping des interactions
   - Tableau récapitulatif des 8 interactions
   - Détails par interaction (contexte, déclencheur, données)
   - Guide de migration localStorage → API
   - Exemples de code avant/après

4. **[ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)** - Vue d'ensemble de l'architecture
   - Diagramme de flux
   - Architecture des composants
   - Flux de données
   - Sécurité
   - Plan de migration

### 🔧 Guide d'Implémentation

5. **[BUBBLE_WORKFLOW_GUIDE.md](./BUBBLE_WORKFLOW_GUIDE.md)** - Guide pour Bubble.io
   - Configuration de l'endpoint
   - Structure du workflow
   - Logique par type d'action
   - Validations et sécurité
   - Gestion des erreurs
   - Tests recommandés

---

## 🗂️ Fichiers de Code

### Types TypeScript

- **[src/types/endpoint.types.ts](../src/types/endpoint.types.ts)**
  - Définition de tous les types d'actions
  - Interfaces pour requêtes/réponses
  - Helpers pour construire les actions

### Services

- **[src/services/endpointRapportFormService.ts](../src/services/endpointRapportFormService.ts)**
  - Service pour interagir avec l'endpoint
  - Méthodes pour chaque type d'action
  - Gestion des erreurs et logging

---

## 🧪 Fichiers de Test

### Scripts de Test

- **[test-endpoint.sh](./test-endpoint.sh)** - Script bash pour tester l'endpoint
  - Tests individuels par action
  - Test batch (actions multiples)
  - Affichage coloré des résultats
  - Usage : `./test-endpoint.sh {signalement|consigne|faux|multiple|photo|all}`

### Payloads de Test

- **[test-payload.json](./test-payload.json)** - Payload JSON de test
  - Exemple complet avec 3 actions
  - Prêt à utiliser avec cURL ou PowerShell

---

## 📊 Résumé des Interactions

| # | Interaction | Fichier Source | Action Type |
|---|------------|---------------|-------------|
| 1 | Créer un signalement | `RapportPieceDetail.tsx` | `CREATE_SIGNALEMENT` |
| 2 | Ajouter consigne IA | `RapportPieceDetail.tsx` | `CREATE_CONSIGNE_IA` |
| 3 | Modifier consigne IA | `RapportPieceDetail.tsx` | `UPDATE_CONSIGNE_IA` |
| 4 | Supprimer consigne IA | `RapportPieceDetail.tsx` | `DELETE_CONSIGNE_IA` |
| 5 | Marquer faux positif | `RapportPieceDetail.tsx` | `MARK_FALSE_POSITIVE` |
| 6 | Changer statut signalement | `RemarquesGenerales.tsx` | `UPDATE_SIGNALEMENT_STATUS` |
| 7 | Sélectionner photo référence | `ModifierPhotosDialog.tsx` | `SELECT_PHOTO_REFERENCE` |
| 8 | Supprimer photo | `ModifierPhotosDialog.tsx` | `DELETE_PHOTO` |

---

## 🚀 Commandes Rapides

### Tester l'Endpoint (PowerShell)

```powershell
$body = Get-Content 'docs/test-payload.json' -Raw
Invoke-WebRequest `
  -Uri 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/endpointrapportform/initialize' `
  -Method POST `
  -ContentType 'application/json' `
  -Body $body
```

### Tester l'Endpoint (cURL)

```bash
curl -X POST \
  'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/endpointrapportform/initialize' \
  -H 'Content-Type: application/json' \
  -d @docs/test-payload.json
```

### Utiliser le Script de Test

```bash
# Rendre le script exécutable
chmod +x docs/test-endpoint.sh

# Tester toutes les actions
./docs/test-endpoint.sh all
```

---

## 📝 Checklist d'Implémentation

### Backend (Bubble.io)

- [ ] Créer le workflow `endpointrapportform`
- [ ] Configurer les paramètres d'entrée
- [ ] Implémenter la validation initiale
- [ ] Implémenter `CREATE_SIGNALEMENT`
- [ ] Implémenter `CREATE_CONSIGNE_IA`
- [ ] Implémenter `UPDATE_CONSIGNE_IA`
- [ ] Implémenter `DELETE_CONSIGNE_IA`
- [ ] Implémenter `MARK_FALSE_POSITIVE`
- [ ] Implémenter `UPDATE_SIGNALEMENT_STATUS`
- [ ] Implémenter `SELECT_PHOTO_REFERENCE`
- [ ] Implémenter `DELETE_PHOTO`
- [ ] Ajouter la gestion d'erreurs
- [ ] Tester avec les payloads fournis

### Frontend (React)

- [ ] Importer le service dans les composants
- [ ] Migrer `handleCreerSignalement`
- [ ] Migrer `handleAjouterConsigneIA`
- [ ] Migrer `handleEditConsigne`
- [ ] Migrer `handleDeleteConsigne`
- [ ] Migrer `handleMarquerCommeFaux`
- [ ] Migrer `handleStatutChange`
- [ ] Migrer `handlePhotoSelect`
- [ ] Migrer `handlePhotoDelete`
- [ ] Ajouter la gestion d'erreurs
- [ ] Ajouter les notifications utilisateur
- [ ] Tester chaque interaction

### Tests

- [ ] Tester chaque action individuellement
- [ ] Tester les actions multiples (batch)
- [ ] Tester la gestion d'erreurs
- [ ] Tester les cas limites
- [ ] Tester les permissions utilisateur

---

## 🎯 Prochaines Étapes

1. **Lire le README** : [README_ENDPOINT_API.md](./README_ENDPOINT_API.md)
2. **Consulter l'architecture** : [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)
3. **Implémenter sur Bubble** : [BUBBLE_WORKFLOW_GUIDE.md](./BUBBLE_WORKFLOW_GUIDE.md)
4. **Tester l'endpoint** : Utiliser les scripts fournis
5. **Migrer le frontend** : Utiliser le service TypeScript

---

## 📞 Support

Pour toute question :
1. Consulter la documentation appropriée ci-dessus
2. Vérifier les exemples de code fournis
3. Utiliser les scripts de test pour valider

---

**Dernière mise à jour** : 2025-11-21  
**Version** : 1.0.0  
**Auteur** : Augment Agent

