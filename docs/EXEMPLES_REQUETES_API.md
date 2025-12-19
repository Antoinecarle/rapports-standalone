# 🔧 Exemples de Requêtes API - Système de Signalements

Ce document contient des exemples concrets de requêtes pour tester les endpoints de l'API.

## 📋 Variables d'Environnement

```bash
# URL de base
BASE_URL="https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf"

# IDs de test (rapport réel)
RAPPORT_ID="1763630457730x621041221232503200"
USER_ID="+33687451235"

# IDs de pièces
PIECE_CUISINE="1763563428946x849625088538311400"
PIECE_SALON="1763563428946x731845328089935700"
PIECE_CHAMBRE="1763563428946x777964311629450600"
PIECE_SALLE_EAU="1763563428946x300322809388199740"
```

---

## 1. Récupérer les Signalements (GET)

### 1.1 Requête cURL

```bash
curl -X GET \
  "https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/signalementlist?rapportid=1763630457730x621041221232503200" \
  -H "Accept: application/json" \
  | jq '.'
```

### 1.2 Requête PowerShell

```powershell
$response = Invoke-WebRequest `
  -Uri "https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/signalementlist?rapportid=1763630457730x621041221232503200" `
  -Headers @{"Accept"="application/json"}

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 1.3 Réponse Attendue (Structure Actuelle)

```json
{
  "status": "success",
  "response": {
    "signalement": [
      {
        "_id": "1763630531738x239078217123237950",
        "rapport_ref": "1763630457730x621041221232503200",
        "Piece_ref": "1763563428946x849625088538311400",
        "typeText": "Check in ménage",
        "description": "Vase cassé",
        "OS_signalementStatut": "Traité",
        "photo": "https://eb0bcaf95c312d7fe9372017cb5f1835.cdn.bubble.io/f1763630529987x507892917038188500/File.jpg",
        "Nom signaleur": "Vounier",
        "Prenom signaleur": "Patrick",
        "phone signaleur": "+33687451235",
        "Created Date": 1763630531745,
        "Modified Date": 1763644798117
      }
    ]
  }
}
```

### 1.4 Réponse Attendue (Structure Enrichie - Après Évolution)

```json
{
  "status": "success",
  "response": {
    "signalement": [...],
    "fauxPositifs": [
      {
        "_id": "fp_1763630600000x123456789",
        "rapport_ref": "1763630457730x621041221232503200",
        "piece_ref": "1763563428946x731845328089935700",
        "probleme_id": "p2",
        "probleme_titre": "Objets ajoutés : Un carnet et un objet noir",
        "raison": "Ces objets font partie de la décoration",
        "marque_par_user_id": "+33687451235",
        "marque_par_nom": "Patrick Vounier",
        "created_date": 1763630600000
      }
    ],
    "consignesIA": [
      {
        "_id": "consigne_1763630800000x111222333",
        "rapport_ref": "1763630457730x621041221232503200",
        "piece_ref": "1763563428946x849625088538311400",
        "probleme_id": "p1",
        "type": "ignorer",
        "consigne": "Ignorer les bouteilles de vin - font partie du décor",
        "cree_par_user_id": "+33687451235",
        "cree_par_nom": "Patrick Vounier",
        "created_date": 1763630800000
      }
    ]
  }
}
```

---

## 2. Créer un Signalement (POST)

### 2.1 Requête cURL

```bash
curl -X POST \
  "https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/endpointrapportform/initialize" \
  -H "Content-Type: application/json" \
  -d '{
    "rapportId": "1763630457730x621041221232503200",
    "version": "live",
    "timestamp": "2025-11-25T10:30:00.000Z",
    "userId": "+33687451235",
    "actions": [
      {
        "actionType": "CREATE_SIGNALEMENT",
        "data": {
          "pieceId": "1763563428946x849625088538311400",
          "probleme": "Tache sur le plan de travail",
          "commentaire": "Grande tache marron visible près de la plaque",
          "photoUrl": null,
          "photoBase64": null
        }
      }
    ]
  }'
```

### 2.2 Requête PowerShell

```powershell
$body = @{
  rapportId = "1763630457730x621041221232503200"
  version = "live"
  timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
  userId = "+33687451235"
  actions = @(
    @{
      actionType = "CREATE_SIGNALEMENT"
      data = @{
        pieceId = "1763563428946x849625088538311400"
        probleme = "Tache sur le plan de travail"
        commentaire = "Grande tache marron visible près de la plaque"
        photoUrl = $null
        photoBase64 = $null
      }
    }
  )
} | ConvertTo-Json -Depth 10

Invoke-WebRequest `
  -Uri "https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/endpointrapportform/initialize" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

---

## 3. Marquer un Problème comme Faux Positif (POST)

### 3.1 Requête cURL

```bash
curl -X POST \
  "https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/endpointrapportform/initialize" \
  -H "Content-Type: application/json" \
  -d '{
    "rapportId": "1763630457730x621041221232503200",
    "version": "live",
    "timestamp": "2025-11-25T10:30:00.000Z",
    "userId": "+33687451235",
    "actions": [
      {
        "actionType": "MARK_FALSE_POSITIVE",
        "data": {
          "pieceId": "1763563428946x731845328089935700",
          "problemeId": "p2"
        }
      }
    ]
  }'
```

### 3.2 Requête PowerShell

```powershell
$body = @{
  rapportId = "1763630457730x621041221232503200"
  version = "live"
  timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
  userId = "+33687451235"
  actions = @(
    @{
      actionType = "MARK_FALSE_POSITIVE"
      data = @{
        pieceId = "1763563428946x731845328089935700"
        problemeId = "p2"
      }
    }
  )
} | ConvertTo-Json -Depth 10

Invoke-WebRequest `
  -Uri "https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/endpointrapportform/initialize" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

---

## 4. Ajouter une Consigne IA (POST)

### 4.1 Consigne de Type "Ignorer"

```bash
curl -X POST \
  "https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/endpointrapportform/initialize" \
  -H "Content-Type: application/json" \
  -d '{
    "rapportId": "1763630457730x621041221232503200",
    "version": "live",
    "timestamp": "2025-11-25T10:30:00.000Z",
    "userId": "+33687451235",
    "actions": [
      {
        "actionType": "CREATE_CONSIGNE_IA",
        "data": {
          "pieceId": "1763563428946x849625088538311400",
          "problemeId": "p1",
          "consigne": "Ignorer les bouteilles de vin sur le plan de travail - font partie de la décoration normale du logement",
          "type": "ignorer"
        }
      }
    ]
  }'
```

### 4.2 Consigne de Type "Surveiller"

```bash
curl -X POST \
  "https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/endpointrapportform/initialize" \
  -H "Content-Type: application/json" \
  -d '{
    "rapportId": "1763630457730x621041221232503200",
    "version": "live",
    "timestamp": "2025-11-25T10:30:00.000Z",
    "userId": "+33687451235",
    "actions": [
      {
        "actionType": "CREATE_CONSIGNE_IA",
        "data": {
          "pieceId": "1763563428946x300322809388199740",
          "problemeId": null,
          "consigne": "Vérifier particulièrement la propreté du plan vasque et l'absence de cheveux dans le siphon",
          "type": "surveiller"
        }
      }
    ]
  }'
```

---

## 5. Actions Multiples (Batch)

### 5.1 Créer un Signalement + Marquer un Faux Positif

```bash
curl -X POST \
  "https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/endpointrapportform/initialize" \
  -H "Content-Type: application/json" \
  -d '{
    "rapportId": "1763630457730x621041221232503200",
    "version": "live",
    "timestamp": "2025-11-25T10:30:00.000Z",
    "userId": "+33687451235",
    "actions": [
      {
        "actionType": "CREATE_SIGNALEMENT",
        "data": {
          "pieceId": "1763563428946x849625088538311400",
          "probleme": "Tache importante sur le plan de travail",
          "commentaire": "Nécessite un nettoyage approfondi",
          "photoUrl": null,
          "photoBase64": null
        }
      },
      {
        "actionType": "MARK_FALSE_POSITIVE",
        "data": {
          "pieceId": "1763563428946x849625088538311400",
          "problemeId": "p1"
        }
      },
      {
        "actionType": "CREATE_CONSIGNE_IA",
        "data": {
          "pieceId": "1763563428946x849625088538311400",
          "problemeId": "p1",
          "consigne": "Les bouteilles de vin sont normales ici",
          "type": "ignorer"
        }
      }
    ]
  }'
```

---

## 6. Tester avec PowerShell (Script Complet)

```powershell
# Variables
$baseUrl = "https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf"
$rapportId = "1763630457730x621041221232503200"
$userId = "+33687451235"
$pieceCuisine = "1763563428946x849625088538311400"

# Fonction helper pour créer le timestamp
function Get-Timestamp {
    return (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

# Test 1: Récupérer les signalements
Write-Host "=== Test 1: Récupération des signalements ===" -ForegroundColor Green
$response = Invoke-WebRequest `
    -Uri "$baseUrl/signalementlist?rapportid=$rapportId" `
    -Headers @{"Accept"="application/json"}
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Test 2: Créer un signalement
Write-Host "`n=== Test 2: Création d'un signalement ===" -ForegroundColor Green
$body = @{
    rapportId = $rapportId
    version = "live"
    timestamp = Get-Timestamp
    userId = $userId
    actions = @(
        @{
            actionType = "CREATE_SIGNALEMENT"
            data = @{
                pieceId = $pieceCuisine
                probleme = "Test de signalement"
                commentaire = "Ceci est un test"
                photoUrl = $null
                photoBase64 = $null
            }
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-WebRequest `
    -Uri "$baseUrl/endpointrapportform/initialize" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Test 3: Marquer comme faux positif
Write-Host "`n=== Test 3: Marquage faux positif ===" -ForegroundColor Green
$body = @{
    rapportId = $rapportId
    version = "live"
    timestamp = Get-Timestamp
    userId = $userId
    actions = @(
        @{
            actionType = "MARK_FALSE_POSITIVE"
            data = @{
                pieceId = $pieceCuisine
                problemeId = "p1"
            }
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-WebRequest `
    -Uri "$baseUrl/endpointrapportform/initialize" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host "`n=== Tests terminés ===" -ForegroundColor Green
```

---

## 7. Vérification des Données

### 7.1 Vérifier qu'un Faux Positif a été créé

```powershell
# Récupérer les signalements enrichis
$response = Invoke-WebRequest `
    -Uri "https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/signalementlist?rapportid=1763630457730x621041221232503200" `
    -Headers @{"Accept"="application/json"}

$data = $response.Content | ConvertFrom-Json

# Afficher les faux positifs
Write-Host "Faux Positifs:" -ForegroundColor Yellow
$data.response.fauxPositifs | ConvertTo-Json -Depth 5
```

### 7.2 Vérifier les Consignes IA

```powershell
# Afficher les consignes IA
Write-Host "Consignes IA:" -ForegroundColor Yellow
$data.response.consignesIA | ConvertTo-Json -Depth 5
```

---

## 📝 Notes Importantes

1. **Timestamps** : Toujours utiliser le format ISO 8601 UTC
2. **IDs de Pièces** : Utiliser les IDs exacts depuis `rapportdataia`
3. **IDs de Problèmes** : Format `p1`, `p2`, `p3`, etc. (depuis `rapportdataia`)
4. **Version** : Toujours spécifier `test` ou `live`

---

**Date de création :** 2025-11-25  
**Dernière mise à jour :** 2025-11-25

