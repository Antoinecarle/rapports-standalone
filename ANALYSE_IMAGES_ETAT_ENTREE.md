# 📸 Analyse des Images d'État d'Entrée (Check-in)

## 🎯 Objectif
Identifier quelle donnée depuis les webhooks permet de récupérer et afficher les **images d'état d'entrée** (photos de check-in).

---

## 🔍 Sources de Données

### 1️⃣ **Endpoint Principal : `rapportfulldata`**
**URL :** `https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/rapportfulldata?rapport={rapportId}`

#### Structure de la réponse :
```typescript
interface FullDataResponse {
  rapportID: string;
  userfirstname?: string;
  userLastname?: string;
  userPhone?: string;
  logementName?: string;
  logementAdress?: string;
  logementUniqueID?: string;
  conciergerieName?: string;
  
  // ❌ Photos de SORTIE uniquement
  photoPiececheckout: PhotoPieceCheckout[];
  
  // ✅ Étapes validées avec photos
  etaperesponse: EtapeResponse[];
  
  // Questions de sortie
  exitQuestion: ExitQuestion[];
  
  // Liste des pièces
  piece?: Piece[];
  
  // Données IA (peut être vide)
  dataia?: DataIA;
}
```

#### 📌 **Point Clé :**
- `photoPiececheckout` contient **uniquement les photos de SORTIE** (checkout)
- Il **N'Y A PAS** de champ `photoPiececheckin` dans cette réponse

---

### 2️⃣ **Endpoint Secondaire : `mydata`**
**URL :** `https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/mydata?rapport={rapportId}`

#### Structure de la réponse :
```typescript
interface MyDataJSON {
  webhook_version: string;
  checkID: string;
  parcours_id: string;
  agent: Agent;
  parcours: Parcours;
  
  // ✅ DONNÉES DE CHECK-IN ICI
  checkin: {
    pieces: Piece[];
    stats: CheckinStats;
    timestamp: string;
    timestamps?: Timestamps;
  };
  
  checkout: any | null;
  signalements: Signalement[];
  timestamps?: Timestamps;
}
```

#### Structure d'une Pièce (Piece) :
```typescript
interface Piece {
  piece_id: string;
  nom: string;
  status: string;
  
  // ✅ ÉTAPES CONTENANT LES PHOTOS
  etapes: Etape[];
}
```

#### Structure d'une Étape (Etape) :
```typescript
interface Etape {
  etape_id: string;
  type: "button_click" | "photo_taken";  // ✅ Type important
  etape_type: string;  // "checkin" ou "checkout"
  status: string;
  timestamp: string;
  is_todo: boolean;
  todo_title: string;
  action?: string;
  comment: string;
  photos_attached?: string[];
  
  // ✅ DONNÉES DE PHOTO
  photo_id?: string;
  photo_url?: string;           // ✅ URL de la photo
  photo_base64?: string | null; // ✅ Photo en base64
  validated?: boolean;
  retake_count?: number;
}
```

---

## 🎯 **RÉPONSE : Comment récupérer les images d'état d'entrée**

### ✅ **Données à utiliser :**

Les images d'état d'entrée se trouvent dans **`mydata.json`** via le chemin suivant :

```
mydata.checkin.pieces[].etapes[]
```

### 🔑 **Critères de filtrage :**

Pour identifier une photo d'état d'entrée, une étape doit respecter **TOUS** ces critères :

1. **`etape_type === "checkin"`** (type de parcours)
2. **`type === "photo_taken"`** OU **`type === "button_click"`** avec photo
3. **`photo_url !== null && photo_url !== ""`** OU **`photo_base64 !== null && photo_base64 !== ""`**

### 📝 **Code d'extraction (déjà implémenté) :**

Fichier : `src/services/rapportDataMapper.ts` (lignes 234-238)

```typescript
// Extraire les photos d'entrée (checkin)
const photosEntreeCapturees = photos
  .filter(photo => photo.etape_type === 'checkin')
  .map(photo => photo.photo_url || photo.photo_base64)
  .filter(url => url && url.trim() !== ''); // Filtrer les URLs vides ou nulles
```

---

## 🔄 **Flux de Traitement Actuel**

### 1. **Chargement des données** (`dataFusionService.ts`)
```typescript
// Charge mydata depuis l'API
const rawData = await myDataService.fetchMyData(rapportId);

// Accède aux pièces du check-in
const pieces = rawData.checkin.pieces;
```

### 2. **Extraction des photos** (`dataFusionService.ts`, lignes 598-615)
```typescript
/**
 * Vérifie si une étape contient une image
 */
private hasImage(etape: Etape): boolean {
  if (etape.type === 'photo_taken') {
    return true;
  }

  if (etape.type === 'button_click') {
    const hasPhotoUrl = !!(etape.photo_url && etape.photo_url.trim() !== '');
    const hasPhotoBase64 = !!(etape.photo_base64 && etape.photo_base64.trim() !== '');
    return hasPhotoUrl || hasPhotoBase64;
  }

  return false;
}
```

### 3. **Filtrage par type de parcours** (`rapportDataMapper.ts`)
```typescript
// Filtrer uniquement les photos de check-in
const photosEntree = photos.filter(photo => photo.etape_type === 'checkin');
```

### 4. **Affichage dans l'interface** (`RapportPieceDetail.tsx`, lignes 285-296)
```tsx
{piece.checkEntree?.photosEntree && piece.checkEntree.photosEntree.length > 0 && (
  <div className="mt-3">
    <button
      onClick={() => setShowPhotosEntree(!showPhotosEntree)}
      className="text-sm text-blue-600 hover:text-blue-800 underline"
    >
      Voir les {piece.checkEntree.photosEntree.length} photo{piece.checkEntree.photosEntree.length > 1 ? 's' : ''} d'entrée
    </button>
    {showPhotosEntree && (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {piece.checkEntree.photosEntree.map((photo, idx) => (
          <img key={idx} src={photo} alt={`Photo d'entrée ${idx + 1}`} className="rounded-lg" />
        ))}
      </div>
    )}
  </div>
)}
```

---

## 📊 **Comparaison des Sources**

| Donnée | Endpoint `fulldata` | Endpoint `mydata` |
|--------|-------------------|------------------|
| **Photos de sortie** | ✅ `photoPiececheckout[]` | ✅ `checkin.pieces[].etapes[]` (filtré par `etape_type === "checkout"`) |
| **Photos d'entrée** | ❌ Pas disponible | ✅ `checkin.pieces[].etapes[]` (filtré par `etape_type === "checkin"`) |
| **Étapes validées** | ✅ `etaperesponse[]` | ✅ `checkin.pieces[].etapes[]` |
| **Métadonnées** | ✅ Complètes | ✅ Complètes |

---

## 🎯 **Résumé**

### ✅ **Donnée permettant de récupérer les images d'état d'entrée :**

**Source :** Endpoint `mydata` → `checkin.pieces[].etapes[]`

**Champs clés :**
- `etape_type: "checkin"` (identifie le type de parcours)
- `type: "photo_taken"` ou `"button_click"` (identifie le type d'action)
- `photo_url` ou `photo_base64` (contient l'image)

**Logique de filtrage :**
```typescript
const photosEntree = mydata.checkin.pieces
  .flatMap(piece => piece.etapes)
  .filter(etape => 
    etape.etape_type === 'checkin' && 
    (etape.type === 'photo_taken' || 
     (etape.type === 'button_click' && (etape.photo_url || etape.photo_base64)))
  )
  .map(etape => etape.photo_url || etape.photo_base64)
  .filter(url => url && url.trim() !== '');
```

---

## 🔧 **Fichiers Concernés**

1. **`src/services/mydataService.ts`** - Récupération des données depuis l'API
2. **`src/services/dataFusionService.ts`** - Fusion et traitement des données
3. **`src/services/rapportDataMapper.ts`** - Extraction et mapping des photos (lignes 234-238)
4. **`src/types/mydata.types.ts`** - Définition des types TypeScript
5. **`src/components/rapport/RapportPieceDetail.tsx`** - Affichage des photos

---

## 📝 **Notes Importantes**

1. **Priorité des sources :** L'application utilise `fulldata` pour les photos de sortie et `mydata` pour les photos d'entrée
2. **Fallback :** Si `fulldata` n'a pas de photos pour une pièce, l'application utilise `mydata` comme fallback
3. **Déduplication :** Les étapes sont dédupliquées par `etape_id` (garde celle avec `photo_url` en priorité)
4. **Format des images :** Les images peuvent être soit des URLs (`photo_url`) soit en base64 (`photo_base64`)

---

## 🚀 **Prochaines Étapes Possibles**

Si vous souhaitez modifier le comportement :

1. **Ajouter un endpoint dédié** pour les photos d'entrée dans `fulldata`
2. **Modifier la logique de filtrage** dans `rapportDataMapper.ts`
3. **Ajouter des métadonnées** supplémentaires aux photos (timestamp, validation, etc.)
4. **Optimiser le chargement** en lazy-loading les images
