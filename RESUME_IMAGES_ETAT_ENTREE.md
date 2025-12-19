# 📸 Résumé : Données pour les Images d'État d'Entrée

## 🎯 Réponse Directe

### ✅ **La donnée qui permet de récupérer les images d'état d'entrée est :**

```
mydata.checkin.pieces[].etapes[]
```

**Avec le filtre :**
```typescript
etape_type === "checkin"
```

---

## 🔑 Champs Clés

### Structure de l'Étape (Etape)
```typescript
interface Etape {
  etape_id: string;
  
  // ✅ CHAMP CLÉ 1 : Type d'action
  type: "button_click" | "photo_taken";
  
  // ✅ CHAMP CLÉ 2 : Type de parcours (FILTRE PRINCIPAL)
  etape_type: string;  // "checkin" pour les photos d'entrée
  
  // ✅ CHAMP CLÉ 3 : URL de la photo
  photo_url?: string;
  
  // ✅ CHAMP CLÉ 4 : Photo en base64 (alternative)
  photo_base64?: string | null;
  
  // Autres champs utiles
  status: string;
  timestamp: string;
  is_todo: boolean;
  todo_title: string;
  validated?: boolean;
  retake_count?: number;
}
```

---

## 📊 Logique de Détection

### Pseudo-code
```
POUR CHAQUE pièce DANS mydata.checkin.pieces :
  POUR CHAQUE étape DANS pièce.etapes :
    SI étape.etape_type === "checkin" :
      SI étape.type === "photo_taken" :
        → C'EST UNE PHOTO D'ENTRÉE
      SINON SI étape.type === "button_click" :
        SI étape.photo_url OU étape.photo_base64 :
          → C'EST UNE PHOTO D'ENTRÉE
```

### Code TypeScript
```typescript
const photosEntree = mydata.checkin.pieces
  .flatMap(piece => piece.etapes)
  .filter(etape => 
    etape.etape_type === 'checkin' && 
    (
      etape.type === 'photo_taken' || 
      (etape.type === 'button_click' && (etape.photo_url || etape.photo_base64))
    )
  )
  .map(etape => etape.photo_url || etape.photo_base64)
  .filter(url => url && url.trim() !== '');
```

---

## 🔄 Endpoints API

### Endpoint pour les Photos d'Entrée
```
GET https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/mydata?rapport={rapportId}
```

**Chemin dans la réponse :**
```
response.checkin.pieces[].etapes[]
```

### Endpoint pour les Photos de Sortie (comparaison)
```
GET https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/rapportfulldata?rapport={rapportId}
```

**Chemin dans la réponse :**
```
response.photoPiececheckout[]
```

---

## 📋 Exemples Concrets

### Exemple 1 : Photo Directe
```json
{
  "etape_id": "etape-salon-1",
  "type": "photo_taken",           // ✅ Photo prise
  "etape_type": "checkin",         // ✅ Type check-in
  "photo_url": "https://example.com/photos/salon.jpg",  // ✅ URL
  "photo_base64": null,
  "timestamp": "2025-11-25T10:15:00Z",
  "validated": true
}
```
**→ Photo d'entrée valide**

### Exemple 2 : Photo via Tâche (TODO)
```json
{
  "etape_id": "etape-salon-todo-1",
  "type": "button_click",          // ✅ Validation de tâche
  "etape_type": "checkin",         // ✅ Type check-in
  "is_todo": true,
  "todo_title": "Vérifier le canapé",
  "photo_url": "https://example.com/photos/canape.jpg",  // ✅ Photo attachée
  "photo_base64": null,
  "timestamp": "2025-11-25T10:20:00Z",
  "validated": true
}
```
**→ Photo d'entrée valide**

### Exemple 3 : Photo en Base64
```json
{
  "etape_id": "etape-cuisine-1",
  "type": "photo_taken",           // ✅ Photo prise
  "etape_type": "checkin",         // ✅ Type check-in
  "photo_url": null,
  "photo_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",  // ✅ Base64
  "timestamp": "2025-11-25T10:45:00Z",
  "validated": true
}
```
**→ Photo d'entrée valide**

### Exemple 4 : Tâche SANS Photo (exclu)
```json
{
  "etape_id": "etape-cuisine-todo-1",
  "type": "button_click",          // ⚠️ Validation de tâche
  "etape_type": "checkin",         // ✅ Type check-in
  "is_todo": true,
  "todo_title": "Vérifier les équipements",
  "photo_url": null,               // ❌ Pas de photo
  "photo_base64": null,            // ❌ Pas de photo
  "timestamp": "2025-11-25T10:50:00Z",
  "validated": true
}
```
**→ PAS une photo d'entrée**

---

## 🎨 Formats de Photo

| Format | Champ | Exemple | Priorité |
|--------|-------|---------|----------|
| **URL** | `photo_url` | `"https://example.com/photo.jpg"` | 🥇 Haute |
| **Base64** | `photo_base64` | `"data:image/jpeg;base64,..."` | 🥈 Moyenne |

**Note :** Si les deux existent, `photo_url` est utilisé en priorité.

---

## 🔍 Différences Check-in vs Check-out

| Aspect | Check-in (Entrée) | Check-out (Sortie) |
|--------|-------------------|-------------------|
| **Endpoint** | `mydata` | `rapportfulldata` |
| **Chemin** | `checkin.pieces[].etapes[]` | `photoPiececheckout[]` |
| **Filtre** | `etape_type === "checkin"` | `etape_type === "checkout"` |
| **Métadonnées** | ✅ Riches (timestamp, validation, TODO, etc.) | ⚠️ Limitées (URL + piece_id) |
| **Endpoint dédié** | ❌ Non | ✅ Oui |

---

## 📂 Fichiers Concernés

### Services
- **`src/services/mydataService.ts`** - Récupération depuis l'API
- **`src/services/dataFusionService.ts`** - Fusion et filtrage (lignes 598-650)
- **`src/services/rapportDataMapper.ts`** - Extraction (lignes 234-238)

### Types
- **`src/types/mydata.types.ts`** - Définitions TypeScript

### Composants
- **`src/components/rapport/RapportPieceDetail.tsx`** - Affichage (lignes 285-296)

---

## 🚀 Utilisation Pratique

### 1. Récupérer les données
```typescript
import { myDataService } from '@/services/mydataService';

const rapportId = "1759313126688x380289228559613950";
const mydata = await myDataService.fetchMyData(rapportId);
```

### 2. Extraire les photos d'entrée pour une pièce
```typescript
const pieceId = "1759313126688x111111111111111111";
const piece = mydata.checkin.pieces.find(p => p.piece_id === pieceId);

const photosEntree = piece.etapes
  .filter(etape => 
    etape.etape_type === 'checkin' && 
    (etape.type === 'photo_taken' || 
     (etape.type === 'button_click' && (etape.photo_url || etape.photo_base64)))
  )
  .map(etape => etape.photo_url || etape.photo_base64)
  .filter(url => url && url.trim() !== '');

console.log(`Photos d'entrée pour ${piece.nom}:`, photosEntree);
```

### 3. Afficher dans l'interface
```tsx
{photosEntree.length > 0 && (
  <div className="grid grid-cols-2 gap-2">
    {photosEntree.map((photo, idx) => (
      <img 
        key={idx} 
        src={photo} 
        alt={`Photo d'entrée ${idx + 1}`} 
        className="rounded-lg"
      />
    ))}
  </div>
)}
```

---

## 📝 Points Importants

1. **Source unique** : `mydata.checkin.pieces[].etapes[]`
2. **Filtre principal** : `etape_type === "checkin"`
3. **Types acceptés** : `photo_taken` OU `button_click` avec photo
4. **Formats supportés** : `photo_url` OU `photo_base64`
5. **Priorité** : `photo_url` > `photo_base64`
6. **Déduplication** : Par `etape_id` (garde celle avec URL en priorité)

---

## 🔗 Documentation Complémentaire

- **`ANALYSE_IMAGES_ETAT_ENTREE.md`** - Analyse détaillée complète
- **`FLUX_IMAGES_ETAT_ENTREE.md`** - Diagrammes et flux de traitement
- **`exemple-mydata-photos-entree.json`** - Exemple de structure JSON

---

## ✅ Checklist de Validation

Pour vérifier qu'une étape est une photo d'entrée :

- [ ] `etape_type === "checkin"` ?
- [ ] `type === "photo_taken"` OU `type === "button_click"` ?
- [ ] `photo_url` existe ET non vide OU `photo_base64` existe ET non vide ?

Si **OUI** aux 3 questions → **C'est une photo d'entrée** ✅
