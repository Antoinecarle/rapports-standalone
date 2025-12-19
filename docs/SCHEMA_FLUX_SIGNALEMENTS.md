# 🔄 Schéma des Flux de Données - Signalements et Faux Positifs

## 📊 Vue d'Ensemble du Système

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Affichage   │  │  Création    │  │  Marquage    │             │
│  │  Rapport     │  │  Signalement │  │  Faux Positif│             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                 │                       │
└─────────┼─────────────────┼─────────────────┼───────────────────────┘
          │                 │                 │
          │ GET             │ POST            │ POST
          │                 │                 │
┌─────────▼─────────────────▼─────────────────▼───────────────────────┐
│                      API BUBBLE.IO                                   │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ signalementlist  │  │ endpointrapport  │  │ rapportdataia    │ │
│  │ (GET)            │  │ form (POST)      │  │ (GET)            │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘ │
│           │                     │                     │             │
│           │                     │                     │             │
│  ┌────────▼─────────────────────▼─────────────────────▼─────────┐  │
│  │                    BASE DE DONNÉES                            │  │
│  │                                                                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │  │
│  │  │Signalement│  │FauxPositif│  │ConsigneIA│  │ Rapport  │     │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux 1 : Chargement d'un Rapport

```
┌──────────┐
│ Frontend │
└────┬─────┘
     │
     │ 1. GET /rapportdataia?rapport={id}
     ▼
┌────────────┐
│   Bubble   │──────► Retourne les problèmes détectés par l'IA
└────┬───────┘        (avec IDs: p1, p2, p3, etc.)
     │
     │ 2. GET /signalementlist?rapportid={id}
     ▼
┌────────────┐
│   Bubble   │──────► Retourne:
└────┬───────┘        - Signalements utilisateurs
     │                - Faux positifs
     │                - Consignes IA
     │
     │ 3. Fusion des données
     ▼
┌──────────┐
│ Frontend │──────► Affiche le rapport avec:
└──────────┘        - Problèmes IA (masqués si faux positif)
                    - Signalements utilisateurs
                    - Consignes IA
```

---

## 🔄 Flux 2 : Création d'un Signalement

```
┌──────────┐
│Utilisateur│
└────┬─────┘
     │ Clique sur "Créer un signalement"
     ▼
┌──────────┐
│ Frontend │
└────┬─────┘
     │ Ouvre le dialogue de création
     │ Utilisateur remplit:
     │ - Problème
     │ - Commentaire
     │ - Photo (optionnel)
     │
     │ POST /endpointrapportform/initialize
     │ {
     │   "actionType": "CREATE_SIGNALEMENT",
     │   "data": {
     │     "pieceId": "...",
     │     "probleme": "...",
     │     "commentaire": "...",
     │     "photoUrl": "..."
     │   }
     │ }
     ▼
┌────────────┐
│   Bubble   │
└────┬───────┘
     │ 1. Crée un nouveau Signalement
     │ 2. Associe au rapport et à la pièce
     │ 3. Retourne succès
     │
     ▼
┌──────────┐
│ Frontend │──────► Recharge les données
└──────────┘        Affiche le nouveau signalement
```

---

## 🔄 Flux 3 : Marquage d'un Faux Positif

```
┌──────────┐
│Utilisateur│
└────┬─────┘
     │ Voit un problème IA incorrect
     │ Clique sur "Marquer comme faux"
     ▼
┌──────────┐
│ Frontend │
└────┬─────┘
     │ POST /endpointrapportform/initialize
     │ {
     │   "actionType": "MARK_FALSE_POSITIVE",
     │   "data": {
     │     "pieceId": "1763563428946x849625088538311400",
     │     "problemeId": "p1"
     │   }
     │ }
     ▼
┌────────────┐
│   Bubble   │
└────┬───────┘
     │ 1. Crée un nouveau FauxPositif
     │    - rapport_ref = rapportId
     │    - piece_ref = pieceId
     │    - probleme_id = "p1"
     │    - marque_par = userId
     │ 2. Retourne succès
     │
     ▼
┌──────────┐
│ Frontend │──────► Recharge les données
└──────────┘        Masque le problème marqué comme faux
```

---

## 🔄 Flux 4 : Ajout d'une Consigne IA

```
┌──────────┐
│Utilisateur│
└────┬─────┘
     │ Clique sur "Ajouter une consigne IA"
     ▼
┌──────────┐
│ Frontend │
└────┬─────┘
     │ Ouvre le dialogue
     │ Utilisateur choisit:
     │ - Type: "ignorer" ou "surveiller"
     │ - Texte de la consigne
     │ - Problème lié (optionnel)
     │
     │ POST /endpointrapportform/initialize
     │ {
     │   "actionType": "CREATE_CONSIGNE_IA",
     │   "data": {
     │     "pieceId": "...",
     │     "problemeId": "p1",
     │     "consigne": "...",
     │     "type": "ignorer"
     │   }
     │ }
     ▼
┌────────────┐
│   Bubble   │
└────┬───────┘
     │ 1. Crée une nouvelle ConsigneIA
     │    - rapport_ref = rapportId
     │    - piece_ref = pieceId
     │    - probleme_id = "p1"
     │    - type = "ignorer"
     │    - consigne = "..."
     │    - cree_par = userId
     │ 2. Retourne succès
     │
     ▼
┌──────────┐
│ Frontend │──────► Recharge les données
└──────────┘        Affiche la nouvelle consigne
```

---

## 📦 Structure des Données dans la Base

### Table: Rapport
```
┌─────────────────────────────────────┐
│ Rapport                             │
├─────────────────────────────────────┤
│ _id: "1763630457730x621041..."      │
│ logement_ref: "..."                 │
│ parcours_ref: "..."                 │
│ statut: "Terminé"                   │
│ ...                                 │
└─────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────┐
│ Signalement                         │
├─────────────────────────────────────┤
│ _id: "1763630531738x239078..."      │
│ rapport_ref: "1763630457730x..."    │
│ Piece_ref: "1763563428946x..."      │
│ description: "Vase cassé"           │
│ OS_signalementStatut: "Traité"      │
│ photo: "https://..."                │
│ ...                                 │
└─────────────────────────────────────┘

         │
         │ 1:N
         ▼
┌─────────────────────────────────────┐
│ FauxPositif (NOUVEAU)               │
├─────────────────────────────────────┤
│ _id: "fp_1763630600000x..."         │
│ rapport_ref: "1763630457730x..."    │
│ piece_ref: "1763563428946x..."      │
│ probleme_id: "p2"                   │
│ probleme_titre: "Objets ajoutés..." │
│ raison: "Décoration normale"        │
│ marque_par_user_id: "+336..."       │
│ marque_par_nom: "Patrick Vounier"   │
│ created_date: 1763630600000         │
└─────────────────────────────────────┘

         │
         │ 1:N
         ▼
┌─────────────────────────────────────┐
│ ConsigneIA (NOUVEAU)                │
├─────────────────────────────────────┤
│ _id: "consigne_1763630800000x..."   │
│ rapport_ref: "1763630457730x..."    │
│ piece_ref: "1763563428946x..."      │
│ probleme_id: "p1" (optionnel)       │
│ type: "ignorer"                     │
│ consigne: "Ignorer les bouteilles"  │
│ cree_par_user_id: "+336..."         │
│ cree_par_nom: "Patrick Vounier"     │
│ created_date: 1763630800000         │
└─────────────────────────────────────┘
```

---

## 🎯 Mapping des Données Frontend

### Problème IA (depuis rapportdataia)
```json
{
  "id": "p1",
  "titre": "Objets ajoutés : Deux bouteilles de vin...",
  "description": "Deux bouteilles de vin et des bouchons...",
  "severite": "faible",
  "detectionIA": true,
  "estFaux": false  // ← Sera true si un FauxPositif existe
}
```

### Faux Positif (depuis signalementlist)
```json
{
  "_id": "fp_1763630600000x123456789",
  "rapport_ref": "1763630457730x621041221232503200",
  "piece_ref": "1763563428946x849625088538311400",
  "probleme_id": "p1",  // ← Référence au problème IA
  "raison": "Ces objets font partie de la décoration",
  "marque_par_nom": "Patrick Vounier",
  "created_date": 1763630600000
}
```

### Logique de Fusion
```typescript
// Dans le mapper
const fauxPositifsIds = fauxPositifs
  .filter(fp => fp.piece_ref === piece.id)
  .map(fp => fp.probleme_id);

const problemesAvecFauxPositifs = piece.problemes.map(probleme => ({
  ...probleme,
  estFaux: fauxPositifsIds.includes(probleme.id)
}));
```

---

## 🎨 Affichage dans l'UI

### Problème Normal (Non Marqué)
```
┌─────────────────────────────────────────────────┐
│ ⚠️ Objets ajoutés : Deux bouteilles de vin     │
│                                                 │
│ Deux bouteilles de vin et des bouchons ont     │
│ été ajoutés sur le plan de travail...          │
│                                                 │
│ [Créer signalement] [Marquer comme faux] [+IA] │
└─────────────────────────────────────────────────┘
```

### Problème Marqué comme Faux Positif
```
┌─────────────────────────────────────────────────┐
│ ✓ Objets ajoutés : Deux bouteilles de vin      │
│   (Marqué comme faux positif)                   │
│                                                 │
│ Raison: Ces objets font partie de la décoration│
│ Marqué par: Patrick Vounier le 25/11/2025      │
│                                                 │
│ [Annuler le marquage]                           │
└─────────────────────────────────────────────────┘
```

### Consigne IA Affichée
```
┌─────────────────────────────────────────────────┐
│ 📝 Consignes pour l'IA                          │
│                                                 │
│ 🔕 Ignorer                                      │
│ Ignorer les bouteilles de vin sur le plan de   │
│ travail - font partie de la décoration normale  │
│ Ajouté par: Patrick Vounier le 25/11/2025      │
│                                                 │
│ ⚠️ Surveiller                                   │
│ Vérifier particulièrement la propreté du plan  │
│ vasque et l'absence de cheveux dans le siphon  │
│ Ajouté par: Patrick Vounier le 25/11/2025      │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Cas d'Usage Concrets

### Cas 1 : Faux Positif Simple
**Situation :** L'IA détecte "Objets ajoutés : Bouteilles de vin" mais c'est normal

**Actions :**
1. Utilisateur clique sur "Marquer comme faux"
2. Frontend envoie `MARK_FALSE_POSITIVE` avec `problemeId: "p1"`
3. Bubble crée un `FauxPositif`
4. Au prochain chargement, le problème est masqué ou grisé

### Cas 2 : Consigne IA pour Ignorer
**Situation :** L'IA détecte toujours les mêmes objets normaux

**Actions :**
1. Utilisateur clique sur "Ajouter consigne IA"
2. Choisit "Ignorer" et écrit "Les bouteilles sont normales"
3. Frontend envoie `CREATE_CONSIGNE_IA` avec `type: "ignorer"`
4. Bubble crée une `ConsigneIA`
5. La consigne s'affiche dans la section dédiée

### Cas 3 : Consigne IA pour Surveiller
**Situation :** Zone sensible à vérifier attentivement

**Actions :**
1. Utilisateur clique sur "Ajouter consigne IA"
2. Choisit "Surveiller" et écrit "Vérifier le plan vasque"
3. Frontend envoie `CREATE_CONSIGNE_IA` avec `type: "surveiller"`
4. Bubble crée une `ConsigneIA`
5. La consigne s'affiche en orange/rouge pour attirer l'attention

---

**Date de création :** 2025-11-25  
**Dernière mise à jour :** 2025-11-25

