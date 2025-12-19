# 📋 Documentation du Système de Signalements et Faux Positifs

## 📖 Table des Matières
1. [Système Actuel](#1-système-actuel)
2. [Évolution Proposée](#2-évolution-proposée)
3. [Exemples de Structures JSON](#3-exemples-de-structures-json)
4. [Guide d'Implémentation Bubble.io](#4-guide-dimplémentation-bubbleio)
5. [Adaptation du Code Frontend](#5-adaptation-du-code-frontend)

---

## 1. Système Actuel

### 1.1 Endpoint de Récupération des Signalements

**URL :** `https://checkeasy-57905.bubbleapps.io/version-{test|live}/api/1.1/wf/signalementlist`

**Méthode :** `GET`

**Paramètres :**
- `rapportid` (string, requis) : L'ID du rapport

**Exemple d'URL complète :**
```
https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/signalementlist?rapportid=1763630457730x621041221232503200
```

**Structure de réponse actuelle :**
```json
{
  "status": "success",
  "response": {
    "signalement": [
      {
        "_id": "1763630531738x239078217123237950",
        "rapport_ref": "1763630457730x621041221232503200",
        "Piece_ref": "1763563428946x849625088538311400",
        "parcours_ref": "1763563429660x336086930275468350",
        "logement_ref": "1746548810037x386469807784722400",
        "Conciergerie": "1730741276842x778024514623373300",
        "typeText": "Check in ménage",
        "description": "Vase cassé",
        "OS_signalementStatut": "Traité",
        "commentaireTraitement": "problème résolu",
        "photo": "https://eb0bcaf95c312d7fe9372017cb5f1835.cdn.bubble.io/f1763630529987x507892917038188500/File.jpg",
        "Nom signaleur": "Vounier",
        "Prenom signaleur": "Patrick",
        "phone signaleur": "+33687451235",
        "Created Date": 1763630531745,
        "Modified Date": 1763644798117,
        "Created By": "non_authenticated_user_checkeasy-57905_live"
      }
    ]
  }
}
```

### 1.2 Endpoint de Création de Signalement

**URL :** `https://checkeasy-57905.bubbleapps.io/version-{test|live}/api/1.1/wf/endpointrapportform/initialize`

**Méthode :** `POST`

**Structure de la requête :**
```json
{
  "rapportId": "1763630457730x621041221232503200",
  "version": "live",
  "timestamp": "2025-11-25T10:30:00.000Z",
  "userId": "+33687451235",
  "actions": [
    {
      "actionType": "CREATE_SIGNALEMENT",
      "data": {
        "pieceId": "1763563428946x849625088538311400",
        "probleme": "Tache sur le canapé",
        "commentaire": "Grande tache marron visible",
        "photoUrl": "https://example.com/photo.jpg",
        "photoBase64": null
      }
    }
  ]
}
```

### 1.3 Endpoint pour Marquer un Problème comme Faux Positif

**URL :** `https://checkeasy-57905.bubbleapps.io/version-{test|live}/api/1.1/wf/endpointrapportform/initialize`

**Méthode :** `POST`

**Structure de la requête :**
```json
{
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
}
```

### 1.4 Endpoint pour Ajouter une Consigne IA

**URL :** `https://checkeasy-57905.bubbleapps.io/version-{test|live}/api/1.1/wf/endpointrapportform/initialize`

**Méthode :** `POST`

**Structure de la requête :**
```json
{
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
        "consigne": "Ignorer les bouteilles de vin sur le plan de travail",
        "type": "ignorer"
      }
    }
  ]
}
```

---

## 2. Évolution Proposée

### 2.1 Objectifs

L'endpoint `signalementlist` doit être enrichi pour retourner :

1. **Les faux positifs** : problèmes détectés par l'IA mais marqués comme incorrects
2. **Les consignes IA** : annotations/commentaires ajoutés par l'utilisateur pour guider l'IA

### 2.2 Nouvelles Données à Capturer

#### A. Faux Positifs (False Positives)
- **ID du problème IA** : référence au problème dans `rapportdataia`
- **ID de la pièce** : à quelle pièce appartient le problème
- **Raison** (optionnel) : pourquoi c'est un faux positif
- **Date de marquage**
- **Utilisateur** qui l'a marqué

#### B. Consignes IA (IA Instructions)
- **ID de la consigne**
- **ID de la pièce**
- **ID du problème** (optionnel, peut être une consigne générale)
- **Type** : `ignorer` ou `surveiller`
- **Texte de la consigne**
- **Date de création**
- **Utilisateur** qui l'a créée

---

## 3. Exemples de Structures JSON

### 3.1 Structure Actuelle (Existante)

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
        "photo": "https://...",
        "Nom signaleur": "Vounier",
        "Prenom signaleur": "Patrick",
        "Created Date": 1763630531745
      }
    ]
  }
}
```

### 3.2 Structure Enrichie Proposée

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
        "photo": "https://...",
        "Nom signaleur": "Vounier",
        "Prenom signaleur": "Patrick",
        "Created Date": 1763630531745
      }
    ],
    "fauxPositifs": [
      {
        "_id": "fp_1763630600000x123456789",
        "rapport_ref": "1763630457730x621041221232503200",
        "piece_ref": "1763563428946x731845328089935700",
        "probleme_id": "p2",
        "probleme_titre": "Objets ajoutés : Un carnet et un objet noir sont présents sur la table basse",
        "raison": "Ces objets font partie de la décoration normale",
        "marque_par_user_id": "+33687451235",
        "marque_par_nom": "Patrick Vounier",
        "created_date": 1763630600000,
        "modified_date": 1763630600000
      },
      {
        "_id": "fp_1763630700000x987654321",
        "rapport_ref": "1763630457730x621041221232503200",
        "piece_ref": "1763563428946x849625088538311400",
        "probleme_id": "p1",
        "probleme_titre": "Objets ajoutés : Deux bouteilles de vin et des bouchons",
        "raison": null,
        "marque_par_user_id": "+33687451235",
        "marque_par_nom": "Patrick Vounier",
        "created_date": 1763630700000,
        "modified_date": 1763630700000
      }
    ],
    "consignesIA": [
      {
        "_id": "consigne_1763630800000x111222333",
        "rapport_ref": "1763630457730x621041221232503200",
        "piece_ref": "1763563428946x849625088538311400",
        "probleme_id": "p1",
        "type": "ignorer",
        "consigne": "Ignorer les bouteilles de vin sur le plan de travail - font partie du décor",
        "cree_par_user_id": "+33687451235",
        "cree_par_nom": "Patrick Vounier",
        "created_date": 1763630800000,
        "modified_date": 1763630800000
      },
      {
        "_id": "consigne_1763630900000x444555666",
        "rapport_ref": "1763630457730x621041221232503200",
        "piece_ref": "1763563428946x300322809388199740",
        "probleme_id": null,
        "type": "surveiller",
        "consigne": "Vérifier particulièrement la propreté du plan vasque",
        "cree_par_user_id": "+33687451235",
        "cree_par_nom": "Patrick Vounier",
        "created_date": 1763630900000,
        "modified_date": 1763630900000
      }
    ]
  }
}
```

### 3.3 Mapping avec les Données du Rapport

Pour référence, voici comment les IDs correspondent aux données du rapport `1763630457730x621041221232503200` :

**Pièces :**
- `1763563428946x849625088538311400` → Cuisine
- `1763563428946x731845328089935700` → Salon
- `1763563428946x777964311629450600` → Chambre
- `1763563428946x300322809388199740` → Salle d'eau

**Problèmes IA de la Cuisine (exemples) :**
- `p1` : "Objets ajoutés : Deux bouteilles de vin et des bouchons..."
- `p2` : "Objets ajoutés : Des objets et du linge sont posés sur le plan de travail..."
- `p3` : "Propreté : Le lave-vaisselle est ouvert et contient de la vaisselle..."

---

## 4. Guide d'Implémentation Bubble.io

### 4.1 Créer les Nouvelles Tables de Données

#### Table : `FauxPositif`
| Champ | Type | Description |
|-------|------|-------------|
| `rapport_ref` | Rapport (relation) | Référence au rapport |
| `piece_ref` | Text | ID de la pièce |
| `probleme_id` | Text | ID du problème IA (ex: "p1", "p2") |
| `probleme_titre` | Text | Titre du problème pour référence |
| `raison` | Text (optionnel) | Raison du marquage |
| `marque_par_user` | User (relation) | Utilisateur qui a marqué |
| `marque_par_nom` | Text | Nom complet de l'utilisateur |
| `Created Date` | Date | Auto-généré |
| `Modified Date` | Date | Auto-généré |

#### Table : `ConsigneIA`
| Champ | Type | Description |
|-------|------|-------------|
| `rapport_ref` | Rapport (relation) | Référence au rapport |
| `piece_ref` | Text | ID de la pièce |
| `probleme_id` | Text (optionnel) | ID du problème lié |
| `type` | Option Set | "ignorer" ou "surveiller" |
| `consigne` | Text | Texte de la consigne |
| `cree_par_user` | User (relation) | Utilisateur créateur |
| `cree_par_nom` | Text | Nom complet de l'utilisateur |
| `Created Date` | Date | Auto-généré |
| `Modified Date` | Date | Auto-généré |

### 4.2 Modifier le Workflow `signalementlist`

**Étapes à ajouter :**

1. **Rechercher les Faux Positifs**
   - Type : Data (Things) → Search for FauxPositifs
   - Contrainte : `rapport_ref = Get data from URL (rapportid)`

2. **Rechercher les Consignes IA**
   - Type : Data (Things) → Search for ConsignesIA
   - Contrainte : `rapport_ref = Get data from URL (rapportid)`

3. **Retourner les Données Enrichies**
   - Modifier le "Return data from API" pour inclure :
     ```
     {
       "status": "success",
       "response": {
         "signalement": [Search for Signalements],
         "fauxPositifs": [Search for FauxPositifs],
         "consignesIA": [Search for ConsignesIA]
       }
     }
     ```

### 4.3 Modifier le Workflow `endpointrapportform`

**Pour l'action `MARK_FALSE_POSITIVE` :**
```
1. Créer un nouveau FauxPositif
   - rapport_ref = Request data's rapportId
   - piece_ref = Request data's actions first item's data's pieceId
   - probleme_id = Request data's actions first item's data's problemeId
   - probleme_titre = [Récupérer depuis rapportdataia si possible]
   - marque_par_nom = Request data's userId
```

**Pour l'action `CREATE_CONSIGNE_IA` :**
```
1. Créer une nouvelle ConsigneIA
   - rapport_ref = Request data's rapportId
   - piece_ref = Request data's actions first item's data's pieceId
   - probleme_id = Request data's actions first item's data's problemeId
   - type = Request data's actions first item's data's type
   - consigne = Request data's actions first item's data's consigne
   - cree_par_nom = Request data's userId
```

---

## 5. Adaptation du Code Frontend

Une fois l'endpoint Bubble configuré, le code frontend sera adapté pour :

### 5.1 Injecter les Faux Positifs

```typescript
// Dans rapportDataMapper.ts
export function mapToPiecesDetails(data: FusedRapportData) {
  return data.detailParPieceSection.map(piece => {
    // ... code existant ...
    
    // Filtrer les problèmes pour exclure les faux positifs
    const fauxPositifsIds = data.rawData.bubbleSignalements
      ?.fauxPositifs
      ?.filter(fp => fp.piece_ref === piece.id)
      ?.map(fp => fp.probleme_id) || [];
    
    const problemesFiltered = piece.problemes.map(probleme => ({
      ...probleme,
      estFaux: fauxPositifsIds.includes(probleme.id)
    }));
    
    return {
      ...piece,
      problemes: problemesFiltered
    };
  });
}
```

### 5.2 Afficher les Consignes IA

```typescript
// Dans RapportPieceDetail.tsx
{piece.consignesIA && piece.consignesIA.length > 0 && (
  <div className="mt-4">
    <h4>Consignes pour l'IA</h4>
    {piece.consignesIA.map(consigne => (
      <div key={consigne._id} className={consigne.type === 'ignorer' ? 'text-gray-500' : 'text-orange-600'}>
        <Badge>{consigne.type}</Badge>
        <p>{consigne.consigne}</p>
      </div>
    ))}
  </div>
)}
```

### 5.3 Masquer les Faux Positifs dans l'UI

```typescript
// Filtrer les problèmes affichés
const problemesVisibles = piece.problemes.filter(p => !p.estFaux);
```

---

## 📝 Résumé des Actions

### Pour Bubble.io :
1. ✅ Créer la table `FauxPositif`
2. ✅ Créer la table `ConsigneIA`
3. ✅ Modifier le workflow `signalementlist` pour retourner ces données
4. ✅ Modifier le workflow `endpointrapportform` pour créer ces entrées

### Pour le Frontend :
1. ⏳ Mettre à jour les types TypeScript
2. ⏳ Adapter le mapper pour injecter les faux positifs
3. ⏳ Adapter l'UI pour afficher/masquer selon les faux positifs
4. ⏳ Afficher les consignes IA dans les sections appropriées

---

**Date de création :** 2025-11-25  
**Dernière mise à jour :** 2025-11-25

