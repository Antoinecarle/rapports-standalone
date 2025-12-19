# Analyse de l'endpoint de gestion des photos dans les étapes

## 📋 Résumé du problème

Actuellement, le système détecte les photos dans les étapes en utilisant deux critères :
1. Le **type** de l'étape (`photo_taken` ou `button_click`)
2. La présence d'une **URL de photo** ou d'un **base64**

**Problème identifié** : Le système ne vérifie pas correctement si une photo ou une étape correspond à un TODO (`is_todo = true`). La détection se fait uniquement sur le type `button_click`, ce qui n'est pas suffisant.

---

## 🔍 Analyse détaillée

### 1. Structure des données (Types)

#### Type `Etape` (mydata.types.ts)
```typescript
export interface Etape {
  etape_id: string;
  type: "button_click" | "photo_taken";  // Type de l'action
  etape_type: string;                     // "checkin" ou "checkout"
  status: string;
  timestamp: string;
  is_todo: boolean;                       // ⚠️ IMPORTANT : Indique si c'est un TODO
  todo_title: string;                     // Titre du TODO
  action?: string;
  comment: string;
  photos_attached?: string[];
  // Pour les photos
  photo_id?: string;
  photo_url?: string;
  photo_base64?: string | null;
  validated?: boolean;
  retake_count?: number;
}
```

**Points clés** :
- `is_todo` : booléen qui indique si l'étape est un TODO
- `todo_title` : titre du TODO associé
- `type` : peut être `"button_click"` OU `"photo_taken"`
- Une photo peut avoir `is_todo = true` même si `type = "photo_taken"`

---

### 2. Logique actuelle de détection des photos

#### Fichier : `dataFusionService.ts`

**Méthode `hasImage()` (lignes 160-172)** :
```typescript
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

**Problème** : Cette méthode ne vérifie PAS le champ `is_todo`. Elle considère toutes les photos, qu'elles soient des TODOs ou non.

**Méthode `getPhotosForPiece()` (lignes 178-181)** :
```typescript
getPhotosForPiece(fusedData: FusedRapportData, pieceId: string): Etape[] {
  const etapes = this.getEtapesForPiece(fusedData, pieceId);
  return etapes.filter(etape => this.hasImage(etape));
}
```

**Problème** : Utilise `hasImage()` qui ne filtre pas les TODOs.

---

### 3. Utilisation dans le mapping des données

#### Fichier : `rapportDataMapper.ts`

**Photos de sortie (lignes 174-177)** :
```typescript
const photosSortieCapturees = photos
  .filter(photo => photo.etape_type === 'checkout' && !photo.is_todo)
  .map(photo => photo.photo_url)
  .filter(url => url && url.trim() !== '');
```

✅ **BON** : Filtre correctement avec `!photo.is_todo`

**Photos d'entrée (lignes 180-183)** :
```typescript
const photosEntreeCapturees = photos
  .filter(photo => photo.etape_type === 'checkin' && !photo.is_todo)
  .map(photo => photo.photo_url)
  .filter(url => url && url.trim() !== '');
```

✅ **BON** : Filtre correctement avec `!photo.is_todo`

**Tâches avec photos (lignes 187-203)** :
```typescript
const tachesAvecPhotos = (piece.tachesValidees || []).map(tache => {
  // Chercher une étape avec is_todo=true qui correspond à cette tâche
  // Peut être de type 'photo_taken' OU 'button_click' avec une image
  const tachePhoto = etapes.find(etape => {
    const hasMatchingTodo = etape.is_todo === true && etape.todo_title === tache.nom;
    if (!hasMatchingTodo) return false;

    // Vérifier si l'étape a une photo
    const hasPhoto = etape.photo_url || etape.photo_base64;
    return hasPhoto;
  });

  return {
    ...tache,
    photo_url: tachePhoto?.photo_url
  };
});
```

✅ **BON** : Cherche explicitement les étapes avec `is_todo === true`

---

## 🎯 Problèmes identifiés

### Problème principal : Incohérence dans la détection

1. **`dataFusionService.hasImage()`** : Ne vérifie PAS `is_todo`
   - Retourne `true` pour TOUTES les photos (TODOs inclus)
   
2. **`rapportDataMapper.ts`** : Filtre correctement avec `!photo.is_todo`
   - Mais dépend de `getPhotosForPiece()` qui utilise `hasImage()`

3. **Statistiques de validation** : Peuvent être faussées
   - `getPhotoValidationStats()` compte TOUTES les photos, y compris les TODOs

---

## ✅ Solutions recommandées

### Solution 1 : Modifier `hasImage()` pour exclure les TODOs

**Fichier** : `dataFusionService.ts`

```typescript
/**
 * Vérifie si une étape contient une image (excluant les TODOs)
 * Une étape a une image si :
 * - is_todo === false OU undefined ET
 * - (type === 'photo_taken' OU type === 'button_click' avec photo)
 */
private hasImage(etape: Etape, includeTodos: boolean = false): boolean {
  // Exclure les TODOs par défaut
  if (!includeTodos && etape.is_todo === true) {
    return false;
  }

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

**Avantages** :
- ✅ Cohérence dans toute l'application
- ✅ Paramètre optionnel pour inclure les TODOs si nécessaire
- ✅ Pas de breaking change (comportement par défaut : exclure les TODOs)

---

### Solution 2 : Créer des méthodes séparées

**Fichier** : `dataFusionService.ts`

```typescript
/**
 * Vérifie si une étape contient une image (tous types)
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

/**
 * Vérifie si une étape est une photo TODO
 */
private isTodoPhoto(etape: Etape): boolean {
  return etape.is_todo === true && this.hasImage(etape);
}

/**
 * Vérifie si une étape est une photo capturée (non-TODO)
 */
private isCapturedPhoto(etape: Etape): boolean {
  return etape.is_todo !== true && this.hasImage(etape);
}

/**
 * Récupère toutes les photos capturées (excluant les TODOs)
 */
getPhotosForPiece(fusedData: FusedRapportData, pieceId: string): Etape[] {
  const etapes = this.getEtapesForPiece(fusedData, pieceId);
  return etapes.filter(etape => this.isCapturedPhoto(etape));
}

/**
 * Récupère toutes les photos TODO
 */
getTodoPhotosForPiece(fusedData: FusedRapportData, pieceId: string): Etape[] {
  const etapes = this.getEtapesForPiece(fusedData, pieceId);
  return etapes.filter(etape => this.isTodoPhoto(etape));
}
```

**Avantages** :
- ✅ Séparation claire des responsabilités
- ✅ API plus explicite
- ✅ Permet de récupérer séparément les photos capturées et les TODOs

---

## 📊 Impact des changements

### Méthodes affectées dans `dataFusionService.ts` :

1. ✅ `getPhotosForPiece()` - Doit exclure les TODOs
2. ✅ `getPhotoValidationStats()` - Doit compter uniquement les photos capturées
3. ⚠️ `getPhotosForEtape()` - À vérifier selon le cas d'usage

### Méthodes dans `rapportDataMapper.ts` :

1. ✅ Déjà correct : filtre avec `!photo.is_todo`
2. ✅ Sera plus cohérent avec les changements dans `dataFusionService`

---

## 🚀 Recommandation finale

**Je recommande la Solution 1** pour les raisons suivantes :

1. **Simplicité** : Modification minimale du code existant
2. **Flexibilité** : Paramètre optionnel pour les cas particuliers
3. **Cohérence** : Comportement uniforme dans toute l'application
4. **Rétrocompatibilité** : Pas de breaking change majeur

### Changements à apporter :

1. Modifier `hasImage()` dans `dataFusionService.ts` (ajouter paramètre `includeTodos`)
2. Vérifier que `getPhotoValidationStats()` utilise bien `includeTodos = false`
3. Tester les statistiques de photos pour s'assurer qu'elles sont correctes

---

## 📝 Notes complémentaires

### Cas d'usage des TODOs :

- **TODOs** : Tâches à accomplir (photos à prendre)
- **Photos capturées** : Photos réellement prises par l'agent
- **Distinction importante** : Une photo TODO n'est PAS une photo capturée

### Exemples de scénarios :

**Scénario 1 : Photo TODO non réalisée**
```json
{
  "etape_id": "123",
  "type": "button_click",
  "is_todo": true,
  "todo_title": "Photo du compteur électrique",
  "photo_url": null
}
```
→ Ne doit PAS être comptée comme photo capturée

**Scénario 2 : Photo TODO réalisée**
```json
{
  "etape_id": "124",
  "type": "photo_taken",
  "is_todo": true,
  "todo_title": "Photo du compteur électrique",
  "photo_url": "https://..."
}
```
→ Doit être associée à la tâche, mais PAS comptée dans les photos de sortie/entrée

**Scénario 3 : Photo capturée normale**
```json
{
  "etape_id": "125",
  "type": "photo_taken",
  "is_todo": false,
  "etape_type": "checkout",
  "photo_url": "https://..."
}
```
→ Doit être comptée dans les photos de sortie
