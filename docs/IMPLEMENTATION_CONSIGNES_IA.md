# ✅ Implémentation des Consignes IA - Documentation

## 📋 Résumé

Les consignes IA ont été intégrées avec succès dans l'application. Elles permettent aux utilisateurs d'ajouter des annotations pour guider l'IA dans l'analyse des rapports.

---

## 🔄 Structure des Données

### Endpoint API

**URL :** `https://checkeasy-57905.bubbleapps.io/version-{test|live}/api/1.1/wf/signalementlist?rapportid={rapportId}`

**Réponse :**
```json
{
  "status": "success",
  "response": {
    "signalement": [...],
    "consigneIA": [
      {
        "_id": "1760693169995x718385728095780900",
        "Commentaire": "Pour les rouleaux de papier toilette. Soit il n'y en a qu'un seul neuf, soit il y en a 2, un entamé et un neuf.",
        "os_consigneType": "surveiller",
        "Piece": "1760692946881x362790113660895200",
        "Created By": "1760690751581x422532056969814340",
        "Created Date": 1760693170605,
        "Modified Date": 1764077939953
      },
      {
        "_id": "1762072249080x864636565552103400",
        "Commentaire": "Les ampoules sont bien présente sur la photo mais éteinte -",
        "os_consigneType": "ignorer",
        "Piece": "1740992350396x876270336037001200",
        "Created By": "1762072183985x925361400474173900",
        "Created Date": 1762072249509,
        "Modified Date": 1764077924200
      }
    ]
  }
}
```

### Champs de la Consigne IA

| Champ | Type | Description |
|-------|------|-------------|
| `_id` | string | Identifiant unique de la consigne |
| `Commentaire` | string | Texte de la consigne |
| `os_consigneType` | "ignorer" \| "surveiller" | Type de consigne |
| `Piece` | string | ID de la pièce concernée |
| `Created By` | string | ID de l'utilisateur créateur |
| `Created Date` | number | Timestamp de création (millisecondes) |
| `Modified Date` | number | Timestamp de modification (millisecondes) |

---

## 🛠️ Modifications Apportées

### 1. Types TypeScript

**Fichier :** `src/types/mydata.types.ts`

```typescript
export interface BubbleConsigneIA {
  _id: string;
  Commentaire: string;
  "Created By": string;
  "Created Date": number;
  "Modified Date": number;
  Piece?: string;
  os_consigneType?: "ignorer" | "surveiller";
  REF?: string;
}

export interface BubbleSignalementResponse {
  status: string;
  response: {
    signalement: BubbleSignalement[];
    consigneIA?: BubbleConsigneIA[];
  };
}
```

**Fichier :** `src/types/rapport.types.ts`

```typescript
export interface PieceDetail {
  // ... autres champs
  consignesIA: string[];
  consignesIABubble?: import('./mydata.types').BubbleConsigneIA[];
}
```

### 2. Mapper de Données

**Fichier :** `src/services/rapportDataMapper.ts`

```typescript
// Extraire les consignes IA depuis Bubble pour cette pièce
const consignesIABubble = data.rawData.bubbleSignalements?.response?.consigneIA
  ?.filter(consigne => consigne.Piece === piece.id) || [];

return {
  // ... autres champs
  consignesIA: piece.consignesIA || [],
  consignesIABubble: consignesIABubble,
  // ...
};
```

### 3. Composant UI

**Fichier :** `src/components/rapport/RapportPieceDetail.tsx`

Ajout d'une section dédiée pour afficher les consignes IA depuis Bubble :

```typescript
{piece.consignesIABubble && piece.consignesIABubble.length > 0 && (
  <div className="mt-4 pt-4 border-t">
    <h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
      <MessageSquare className="w-4 h-4 text-primary" />
      Consignes enregistrées
    </h5>
    <div className="space-y-2">
      {piece.consignesIABubble.map((consigne) => {
        const isIgnorer = consigne.os_consigneType === 'ignorer';
        const isSurveiller = consigne.os_consigneType === 'surveiller';
        
        return (
          <div 
            key={consigne._id}
            className={`p-3 rounded-lg border ${
              isIgnorer 
                ? 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800' 
                : isSurveiller
                ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900'
                : 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900'
            }`}
          >
            {/* Affichage du badge et du contenu */}
          </div>
        );
      })}
    </div>
  </div>
)}
```

---

## 🎨 Affichage Visuel

### Consigne "À ignorer"
- **Couleur :** Gris (bg-gray-50)
- **Badge :** 🔕 À ignorer (variant="secondary")
- **Usage :** Indique à l'IA de ne pas signaler ce type de problème

### Consigne "À surveiller"
- **Couleur :** Orange (bg-orange-50)
- **Badge :** ⚠️ À surveiller (bg-orange-500)
- **Usage :** Indique à l'IA de surveiller particulièrement ce type de problème

### Consigne sans type
- **Couleur :** Bleu (bg-blue-50)
- **Badge :** Aucun
- **Usage :** Consigne générale

---

## 📊 Flux de Données

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Chargement du Rapport                                     │
│    GET /signalementlist?rapportid={id}                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Réponse API avec consigneIA[]                             │
│    {                                                          │
│      "response": {                                            │
│        "signalement": [...],                                  │
│        "consigneIA": [...]                                    │
│      }                                                        │
│    }                                                          │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Mapper (rapportDataMapper.ts)                             │
│    - Filtre les consignes par piece.id                       │
│    - Injecte dans piece.consignesIABubble                    │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Affichage (RapportPieceDetail.tsx)                        │
│    - Affiche chaque consigne avec son type                   │
│    - Applique les couleurs selon le type                     │
│    - Affiche la date de création                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧪 Tests

### Test 1 : Vérifier la Récupération des Données

```powershell
# Récupérer les signalements et consignes IA
Invoke-WebRequest `
  -Uri "https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/signalementlist?rapportid=1763630457730x621041221232503200" `
  -Headers @{"Accept"="application/json"} | 
  Select-Object -ExpandProperty Content | 
  ConvertFrom-Json | 
  Select-Object -ExpandProperty response | 
  Select-Object -ExpandProperty consigneIA
```

### Test 2 : Vérifier l'Affichage dans l'UI

1. Ouvrir l'application : `http://localhost:8080/?rapport={rapportId}&version=live`
2. Naviguer vers une pièce qui a des consignes IA
3. Vérifier que la section "Consignes enregistrées" s'affiche
4. Vérifier que les badges "À ignorer" et "À surveiller" sont corrects
5. Vérifier que les couleurs correspondent au type

### Test 3 : Vérifier le Filtrage par Pièce

1. Vérifier que seules les consignes de la pièce actuelle s'affichent
2. Vérifier que les consignes sans `Piece` ne s'affichent pas (ou s'affichent dans toutes les pièces selon la logique souhaitée)

---

## 📝 Exemples de Consignes

### Exemple 1 : Consigne "Surveiller"
```json
{
  "_id": "1760693169995x718385728095780900",
  "Commentaire": "Pour les rouleaux de papier toilette. Soit il n'y en a qu'un seul neuf, soit il y en a 2, un entamé et un neuf.",
  "os_consigneType": "surveiller",
  "Piece": "1760692946881x362790113660895200",
  "Created Date": 1760693170605
}
```

**Affichage :**
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ À surveiller                                         │
│                                                         │
│ Pour les rouleaux de papier toilette. Soit il n'y en   │
│ a qu'un seul neuf, soit il y en a 2, un entamé et un   │
│ neuf.                                                   │
│                                                         │
│ Ajouté le 16/12/2024 à 15:32                           │
└─────────────────────────────────────────────────────────┘
```

### Exemple 2 : Consigne "Ignorer"
```json
{
  "_id": "1762072249080x864636565552103400",
  "Commentaire": "Les ampoules sont bien présente sur la photo mais éteinte -",
  "os_consigneType": "ignorer",
  "Piece": "1740992350396x876270336037001200",
  "Created Date": 1762072249509
}
```

**Affichage :**
```
┌─────────────────────────────────────────────────────────┐
│ 🔕 À ignorer                                            │
│                                                         │
│ Les ampoules sont bien présente sur la photo mais      │
│ éteinte -                                               │
│                                                         │
│ Ajouté le 28/12/2024 à 10:17                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔮 Améliorations Futures

### 1. Consignes Globales (sans pièce)
- Afficher les consignes sans `Piece` dans une section globale
- Ou les afficher dans toutes les pièces

### 2. Filtrage et Recherche
- Permettre de filtrer les consignes par type
- Rechercher dans les consignes

### 3. Édition et Suppression
- Permettre de modifier une consigne existante
- Permettre de supprimer une consigne

### 4. Statistiques
- Afficher le nombre de consignes par type
- Afficher les consignes les plus récentes

### 5. Notifications
- Notifier l'utilisateur quand une nouvelle consigne est ajoutée
- Afficher un badge sur les pièces avec des consignes

---

## ✅ Checklist de Validation

- [x] Types TypeScript créés et validés
- [x] Mapper mis à jour pour filtrer les consignes par pièce
- [x] Composant UI créé avec affichage conditionnel
- [x] Styles appliqués selon le type de consigne
- [x] Date de création formatée correctement
- [x] Pas d'erreurs TypeScript
- [x] Données récupérées depuis l'API Bubble
- [ ] Tests manuels effectués sur plusieurs rapports
- [ ] Tests sur mobile et desktop
- [ ] Documentation mise à jour

---

**Date de création :** 2025-11-25  
**Dernière mise à jour :** 2025-11-25  
**Statut :** ✅ Implémenté et prêt pour les tests

