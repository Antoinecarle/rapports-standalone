# 🔄 Flux de Traitement des Images d'État d'Entrée

## 📊 Architecture des Données

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENDPOINTS API BUBBLE                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────────┐                    ┌──────────────────────┐
│  rapportfulldata  │                    │      mydata          │
├───────────────────┤                    ├──────────────────────┤
│ ✅ Photos SORTIE  │                    │ ✅ Photos ENTRÉE     │
│ ✅ Étapes validées│                    │ ✅ Photos SORTIE     │
│ ✅ Exit questions │                    │ ✅ Étapes complètes  │
│ ✅ Métadonnées    │                    │ ✅ Signalements      │
│ ❌ Photos ENTRÉE  │                    │ ✅ Timestamps        │
└───────────────────┘                    └──────────────────────┘
        │                                           │
        │                                           │
        └─────────────────────┬─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ DataFusionService│
                    │   (Fusion des    │
                    │    données)      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ FusedRapportData │
                    │  (Données unifiées)│
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │RapportDataMapper │
                    │  (Extraction &   │
                    │   Mapping)       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ MappedRapportData│
                    │ (Données pour UI)│
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │RapportPieceDetail│
                    │  (Affichage UI)  │
                    └──────────────────┘
```

---

## 🎯 Extraction des Photos d'Entrée

### Étape 1 : Récupération depuis `mydata`

```typescript
// mydata.json structure
{
  checkin: {
    pieces: [
      {
        piece_id: "xxx",
        nom: "Salon",
        etapes: [
          {
            etape_id: "etape-1",
            type: "photo_taken",      // ✅ Type d'action
            etape_type: "checkin",    // ✅ Type de parcours
            photo_url: "https://...", // ✅ URL de la photo
            photo_base64: null,
            timestamp: "2025-11-25T10:00:00Z"
          }
        ]
      }
    ]
  }
}
```

### Étape 2 : Filtrage dans `dataFusionService.ts`

```typescript
/**
 * Vérifie si une étape contient une image
 */
private hasImage(etape: Etape): boolean {
  // Cas 1 : Photo prise directement
  if (etape.type === 'photo_taken') {
    return true;
  }

  // Cas 2 : Photo attachée à un bouton (TODO)
  if (etape.type === 'button_click') {
    const hasPhotoUrl = !!(etape.photo_url && etape.photo_url.trim() !== '');
    const hasPhotoBase64 = !!(etape.photo_base64 && etape.photo_base64.trim() !== '');
    return hasPhotoUrl || hasPhotoBase64;
  }

  return false;
}
```

### Étape 3 : Extraction dans `rapportDataMapper.ts`

```typescript
// Extraire les photos d'entrée (checkin)
const photosEntreeCapturees = photos
  .filter(photo => photo.etape_type === 'checkin')  // ✅ Filtre par type
  .map(photo => photo.photo_url || photo.photo_base64) // ✅ Récupère l'URL ou base64
  .filter(url => url && url.trim() !== '');  // ✅ Élimine les valeurs vides
```

### Étape 4 : Affichage dans `RapportPieceDetail.tsx`

```tsx
{piece.checkEntree?.photosEntree && piece.checkEntree.photosEntree.length > 0 && (
  <div className="mt-3">
    <button onClick={() => setShowPhotosEntree(!showPhotosEntree)}>
      Voir les {piece.checkEntree.photosEntree.length} photo(s) d'entrée
    </button>
    {showPhotosEntree && (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {piece.checkEntree.photosEntree.map((photo, idx) => (
          <img key={idx} src={photo} alt={`Photo d'entrée ${idx + 1}`} />
        ))}
      </div>
    )}
  </div>
)}
```

---

## 🔍 Critères de Détection

### ✅ Une étape est une PHOTO D'ENTRÉE si :

```
┌─────────────────────────────────────────────────────┐
│  CRITÈRE 1 : etape_type === "checkin"              │
│  (Identifie le type de parcours)                   │
└─────────────────────────────────────────────────────┘
                    ET
┌─────────────────────────────────────────────────────┐
│  CRITÈRE 2 : type === "photo_taken"                │
│  OU                                                 │
│  (type === "button_click" ET photo existe)         │
│  (Identifie le type d'action)                      │
└─────────────────────────────────────────────────────┘
                    ET
┌─────────────────────────────────────────────────────┐
│  CRITÈRE 3 : photo_url !== null                    │
│  OU                                                 │
│  photo_base64 !== null                             │
│  (Vérifie qu'une photo existe)                     │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Types d'Étapes

### 1️⃣ **Photo Directe** (`photo_taken`)
```json
{
  "etape_id": "etape-salon-1",
  "type": "photo_taken",           // ✅ Photo prise directement
  "etape_type": "checkin",
  "photo_url": "https://...",
  "photo_base64": null
}
```
**→ Toujours une photo**

### 2️⃣ **Bouton avec Photo** (`button_click` + photo)
```json
{
  "etape_id": "etape-salon-todo-1",
  "type": "button_click",          // ✅ Validation de tâche
  "etape_type": "checkin",
  "is_todo": true,
  "todo_title": "Vérifier le canapé",
  "photo_url": "https://...",      // ✅ Photo attachée
  "photo_base64": null
}
```
**→ Photo si `photo_url` ou `photo_base64` existe**

### 3️⃣ **Bouton sans Photo** (`button_click` sans photo)
```json
{
  "etape_id": "etape-cuisine-todo-1",
  "type": "button_click",          // ✅ Validation de tâche
  "etape_type": "checkin",
  "is_todo": true,
  "todo_title": "Vérifier les équipements",
  "photo_url": null,               // ❌ Pas de photo
  "photo_base64": null
}
```
**→ Pas une photo**

---

## 🎨 Formats de Photo Supportés

### Format 1 : URL
```json
{
  "photo_url": "https://example.com/photos/salon-checkin-1.jpg",
  "photo_base64": null
}
```
**→ Image hébergée sur un serveur**

### Format 2 : Base64
```json
{
  "photo_url": null,
  "photo_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```
**→ Image encodée en base64**

### Format 3 : Les deux (priorité à l'URL)
```json
{
  "photo_url": "https://example.com/photos/salon-checkin-1.jpg",
  "photo_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```
**→ L'application utilise `photo_url` en priorité**

---

## 🔄 Comparaison Check-in vs Check-out

| Critère | Check-in (Entrée) | Check-out (Sortie) |
|---------|-------------------|-------------------|
| **Source principale** | `mydata.checkin.pieces[].etapes[]` | `fulldata.photoPiececheckout[]` |
| **Source secondaire** | - | `mydata.checkin.pieces[].etapes[]` (filtré) |
| **Filtre `etape_type`** | `"checkin"` | `"checkout"` |
| **Endpoint dédié** | ❌ Non | ✅ Oui (`photoPiececheckout`) |
| **Métadonnées** | ✅ Complètes (timestamp, validation, etc.) | ⚠️ Limitées (URL uniquement) |

---

## 🚀 Exemple Complet

### Données brutes (mydata.json)
```json
{
  "checkin": {
    "pieces": [
      {
        "piece_id": "piece-salon",
        "nom": "Salon",
        "etapes": [
          {
            "etape_id": "etape-1",
            "type": "photo_taken",
            "etape_type": "checkin",
            "photo_url": "https://example.com/photo1.jpg"
          },
          {
            "etape_id": "etape-2",
            "type": "photo_taken",
            "etape_type": "checkin",
            "photo_url": "https://example.com/photo2.jpg"
          },
          {
            "etape_id": "etape-3",
            "type": "button_click",
            "etape_type": "checkin",
            "is_todo": true,
            "photo_url": null
          }
        ]
      }
    ]
  }
}
```

### Résultat après traitement
```typescript
{
  checkEntree: {
    photosEntree: [
      "https://example.com/photo1.jpg",  // ✅ etape-1
      "https://example.com/photo2.jpg"   // ✅ etape-2
      // ❌ etape-3 exclu (pas de photo)
    ]
  }
}
```

---

## 📝 Points Clés à Retenir

1. **Source unique** : Les photos d'entrée viennent **uniquement** de `mydata.checkin.pieces[].etapes[]`
2. **Filtre essentiel** : `etape_type === "checkin"` est le critère principal
3. **Types multiples** : Les photos peuvent venir de `photo_taken` OU `button_click`
4. **Formats flexibles** : Support de `photo_url` ET `photo_base64`
5. **Déduplication** : Les étapes sont dédupliquées par `etape_id`
6. **Priorité URL** : Si les deux formats existent, `photo_url` est utilisé en priorité

---

## 🔧 Fichiers à Consulter

1. **`src/services/mydataService.ts`** - Récupération des données
2. **`src/services/dataFusionService.ts`** - Logique de filtrage (lignes 598-650)
3. **`src/services/rapportDataMapper.ts`** - Extraction des photos (lignes 234-238)
4. **`src/types/mydata.types.ts`** - Définitions TypeScript
5. **`src/components/rapport/RapportPieceDetail.tsx`** - Affichage UI (lignes 285-296)
