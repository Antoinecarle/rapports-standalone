# 📚 Documentation : Analyse des Images d'État d'Entrée

Cette documentation explique comment les images d'état d'entrée (check-in) sont récupérées depuis les webhooks Bubble.io et affichées dans l'application.

---

## 🎯 Réponse Rapide

**Question :** Quelle donnée permet de récupérer les images d'état d'entrée ?

**Réponse :** Les images d'état d'entrée proviennent de l'endpoint **`mydata`**, dans le chemin :
```
mydata.checkin.pieces[].etapes[]
```

Avec le filtre : **`etape_type === "checkin"`**

---

## 📖 Documents Disponibles

### 1️⃣ **RESUME_IMAGES_ETAT_ENTREE.md** ⭐ **COMMENCER ICI**
- ✅ Réponse directe et concise
- ✅ Exemples pratiques
- ✅ Code TypeScript prêt à l'emploi
- ✅ Checklist de validation

**Idéal pour :** Comprendre rapidement la solution

---

### 2️⃣ **ANALYSE_IMAGES_ETAT_ENTREE.md**
- 📊 Analyse complète des endpoints
- 🔍 Comparaison des sources de données
- 📝 Structure détaillée des réponses API
- 🔧 Liste des fichiers concernés
- 🚀 Suggestions d'amélioration

**Idéal pour :** Comprendre l'architecture complète

---

### 3️⃣ **FLUX_IMAGES_ETAT_ENTREE.md**
- 🎨 Diagrammes visuels du flux de données
- 🔄 Schémas de traitement étape par étape
- 📋 Comparaison des types d'étapes
- 🎯 Critères de détection illustrés
- 💡 Exemples complets avec résultats

**Idéal pour :** Visualiser le flux de traitement

---

### 4️⃣ **exemple-mydata-photos-entree.json**
- 📄 Exemple réel de structure JSON
- 📸 3 pièces avec différents types de photos
- 📝 Annotations explicatives
- 🔍 Section d'analyse intégrée
- ✅ Cas d'usage variés (URL, base64, TODO)

**Idéal pour :** Voir un exemple concret de données

---

## 🚀 Par où commencer ?

### Si vous voulez juste la réponse :
1. Lisez **`RESUME_IMAGES_ETAT_ENTREE.md`**
2. Consultez **`exemple-mydata-photos-entree.json`**

### Si vous voulez comprendre en profondeur :
1. Lisez **`RESUME_IMAGES_ETAT_ENTREE.md`**
2. Consultez **`FLUX_IMAGES_ETAT_ENTREE.md`** pour les diagrammes
3. Lisez **`ANALYSE_IMAGES_ETAT_ENTREE.md`** pour l'architecture complète
4. Explorez **`exemple-mydata-photos-entree.json`** pour les exemples

### Si vous voulez modifier le code :
1. Lisez **`ANALYSE_IMAGES_ETAT_ENTREE.md`** section "Fichiers Concernés"
2. Consultez **`FLUX_IMAGES_ETAT_ENTREE.md`** section "Fichiers à Consulter"
3. Utilisez les exemples de **`RESUME_IMAGES_ETAT_ENTREE.md`** section "Utilisation Pratique"

---

## 🔑 Informations Clés

### Endpoint API
```
GET https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/mydata?rapport={rapportId}
```

### Chemin dans la réponse
```
response.checkin.pieces[].etapes[]
```

### Filtre principal
```typescript
etape_type === "checkin"
```

### Champs de photo
```typescript
photo_url?: string;           // URL de la photo (priorité haute)
photo_base64?: string | null; // Photo en base64 (priorité basse)
```

---

## 📂 Structure des Documents

```
rapports-standalone/
├── RESUME_IMAGES_ETAT_ENTREE.md          ⭐ Commencer ici
├── ANALYSE_IMAGES_ETAT_ENTREE.md         📊 Analyse complète
├── FLUX_IMAGES_ETAT_ENTREE.md            🎨 Diagrammes visuels
├── exemple-mydata-photos-entree.json     📄 Exemple JSON
└── README_ANALYSE_IMAGES.md              📚 Ce fichier
```

---

## 🔧 Fichiers Source Concernés

### Services (Logique métier)
- `src/services/mydataService.ts` - Récupération des données
- `src/services/dataFusionService.ts` - Fusion et filtrage
- `src/services/rapportDataMapper.ts` - Extraction et mapping

### Types (Définitions TypeScript)
- `src/types/mydata.types.ts` - Structure des données

### Composants (Interface utilisateur)
- `src/components/rapport/RapportPieceDetail.tsx` - Affichage des photos

---

## 💡 Cas d'Usage

### Cas 1 : Récupérer toutes les photos d'entrée d'un rapport
```typescript
const mydata = await myDataService.fetchMyData(rapportId);
const toutesLesPhotosEntree = mydata.checkin.pieces
  .flatMap(piece => piece.etapes)
  .filter(etape => 
    etape.etape_type === 'checkin' && 
    (etape.type === 'photo_taken' || 
     (etape.type === 'button_click' && (etape.photo_url || etape.photo_base64)))
  )
  .map(etape => etape.photo_url || etape.photo_base64);
```

### Cas 2 : Récupérer les photos d'entrée d'une pièce spécifique
```typescript
const piece = mydata.checkin.pieces.find(p => p.piece_id === pieceId);
const photosEntreePiece = piece.etapes
  .filter(etape => etape.etape_type === 'checkin')
  .filter(etape => 
    etape.type === 'photo_taken' || 
    (etape.type === 'button_click' && (etape.photo_url || etape.photo_base64))
  )
  .map(etape => etape.photo_url || etape.photo_base64);
```

### Cas 3 : Compter les photos d'entrée par pièce
```typescript
const statsParPiece = mydata.checkin.pieces.map(piece => ({
  nom: piece.nom,
  nombrePhotos: piece.etapes.filter(etape => 
    etape.etape_type === 'checkin' && 
    (etape.type === 'photo_taken' || 
     (etape.type === 'button_click' && (etape.photo_url || etape.photo_base64)))
  ).length
}));
```

---

## ❓ FAQ

### Q1 : Pourquoi les photos d'entrée ne sont pas dans `rapportfulldata` ?
**R :** L'endpoint `rapportfulldata` contient uniquement les photos de **sortie** (`photoPiececheckout`). Les photos d'entrée sont dans `mydata.checkin.pieces[].etapes[]`.

### Q2 : Quelle est la différence entre `photo_url` et `photo_base64` ?
**R :** 
- `photo_url` : URL de la photo hébergée sur un serveur
- `photo_base64` : Photo encodée en base64 (intégrée directement)
- Si les deux existent, `photo_url` est utilisé en priorité

### Q3 : Comment identifier une photo d'entrée vs une photo de sortie ?
**R :** Via le champ `etape_type` :
- `etape_type === "checkin"` → Photo d'entrée
- `etape_type === "checkout"` → Photo de sortie

### Q4 : Toutes les étapes de type `button_click` ont-elles une photo ?
**R :** Non. Seules celles avec `photo_url` ou `photo_base64` non vide ont une photo.

### Q5 : Comment gérer les photos manquantes ?
**R :** Filtrer les URLs vides :
```typescript
.filter(url => url && url.trim() !== '')
```

---

## 🎯 Checklist de Validation

Pour vérifier qu'une étape est une photo d'entrée :

- [ ] `etape_type === "checkin"` ?
- [ ] `type === "photo_taken"` OU `type === "button_click"` ?
- [ ] `photo_url` existe ET non vide OU `photo_base64` existe ET non vide ?

Si **OUI** aux 3 questions → **C'est une photo d'entrée** ✅

---

## 📞 Support

Pour toute question ou amélioration de cette documentation :
1. Consultez les fichiers source dans `src/services/`
2. Vérifiez les types dans `src/types/mydata.types.ts`
3. Testez avec `exemple-mydata-photos-entree.json`

---

## 📅 Dernière mise à jour

**Date :** 2025-11-25  
**Version :** 1.0  
**Auteur :** Analyse automatique du code source
