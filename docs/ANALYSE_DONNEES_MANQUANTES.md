# 🔍 Analyse des Données Manquantes - Rapport Page

## 📊 Problème Identifié

Sur l'URL : `http://localhost:8080/?rapport=1763649940640x234834439216168540&version=test`

### Données Manquantes Affichées :
- ❌ **Adresse** : "Adresse non renseignée"
- ❌ **Dates** : "Séjour du  au " (vides)
- ❌ **Voyageur** : "Non renseigné"
- ❌ **Email** : vide
- ❌ **Téléphone** : vide

---

## 🔎 Analyse des Sources de Données

### 1. **API `rapportdataia` (Analyses IA)**

```json
{
  "reportMetadata": {
    "logement": "Adresse non renseignée",  ❌
    "dateDebut": "",                        ❌
    "dateFin": "",                          ❌
    "operateur": "Non renseigné"            ❌
  },
  "syntheseSection": {
    "logement": "Adresse non renseignée",  ❌
    "voyageur": "Non renseigné",           ❌
    "email": "",                            ❌
    "telephone": "",                        ❌
    "dateDebut": "",                        ❌
    "dateFin": "",                          ❌
    "heureCheckin": "",                     ❌
    "heureCheckout": ""                     ❌
  }
}
```

**Conclusion** : L'API IA ne retourne PAS les données de base (adresse, dates, voyageur).

---

### 2. **API `rapportdata` (MyData - Données Brutes)**

```json
{
  "logement_id": null,                     ❌
  "logement_name": null,                   ❌
  
  "agent": {
    "firstname": "Antoine",                ✅ DISPONIBLE
    "lastname": "Carle",                   ✅ DISPONIBLE
    "phone": "+33788321962",               ✅ DISPONIBLE
    "type_label": "Voyageur"               ✅ DISPONIBLE
  },
  
  "parcours": {
    "start_time": "2025-11-20T14:46:54.652Z",  ✅ DISPONIBLE
    "name": "Parcours ménage (copie)"
  },
  
  "timestamps": {
    "session_start": "2025-11-20T14:46:54.653Z",      ✅ DISPONIBLE
    "checkin_completed": "2025-11-20T14:46:11.474Z",  ✅ DISPONIBLE
    "checkinEndHour": "2025-11-20T14:46:11.474Z"      ✅ DISPONIBLE
  }
}
```

**Conclusion** : MyData contient des informations exploitables mais PAS l'adresse du logement ni les dates de séjour.

---

## 💡 Données Exploitables Comme Fallback

### ✅ Informations Agent (Voyageur)
- **Nom complet** : `agent.firstname + agent.lastname` → "Antoine Carle"
- **Téléphone** : `agent.phone` → "+33788321962"
- **Type** : `agent.type_label` → "Voyageur"

### ✅ Timestamps du Parcours
- **Début session** : `timestamps.session_start` → "2025-11-20T14:46:54.653Z"
- **Fin checkin** : `timestamps.checkin_completed` → "2025-11-20T14:46:11.474Z"
- **Heure fin** : `timestamps.checkinEndHour` → "2025-11-20T14:46:11.474Z"

### ❌ Données NON Disponibles
- **Adresse logement** : Ni dans AI data, ni dans myData
- **Dates de séjour** : Ni dans AI data, ni dans myData
- **Email voyageur** : Ni dans AI data, ni dans myData

---

## 🛠️ Solutions Proposées

### Solution 1 : Utiliser les Données Agent comme Fallback

**Modifier `rapportDataMapper.ts`** pour utiliser les données de `rawData.agent` quand `syntheseSection` est vide :

```typescript
export function mapToRapportSynthese(data: FusedRapportData) {
  const { syntheseSection, rawData } = data;
  
  // Fallback sur les données agent si syntheseSection est vide
  const voyageur = syntheseSection.voyageur && syntheseSection.voyageur !== "Non renseigné"
    ? syntheseSection.voyageur
    : `${rawData.agent.firstname} ${rawData.agent.lastname}`;
    
  const telephone = syntheseSection.telephone || rawData.agent.phone;
  
  return {
    logement: syntheseSection.logement,
    voyageur: voyageur,
    telephone: telephone,
    email: syntheseSection.email,
    // ...
  };
}
```

### Solution 2 : Utiliser les Timestamps du Parcours pour les Dates

```typescript
// Si dateDebut/dateFin sont vides, utiliser les timestamps
const dateDebut = syntheseSection.dateDebut || 
  (rawData.timestamps?.session_start 
    ? new Date(rawData.timestamps.session_start).toLocaleDateString('fr-FR')
    : '');
    
const dateFin = syntheseSection.dateFin || 
  (rawData.timestamps?.checkin_completed 
    ? new Date(rawData.timestamps.checkin_completed).toLocaleDateString('fr-FR')
    : '');
```

### Solution 3 : Affichage Conditionnel

**Modifier `RapportSynthese.tsx`** pour ne pas afficher les sections vides :

```typescript
{/* N'afficher l'adresse que si elle est renseignée */}
{rapport.logement && rapport.logement !== "Adresse non renseignée" && (
  <h1>{rapport.logement}</h1>
)}

{/* N'afficher les dates que si elles existent */}
{(rapport.dateDebut || rapport.dateFin) && (
  <p>Séjour du {rapport.dateDebut} au {rapport.dateFin}</p>
)}
```

---

## 🎯 Recommandation

**Approche Hybride** :
1. ✅ Utiliser `agent.firstname + lastname` comme fallback pour le voyageur
2. ✅ Utiliser `agent.phone` comme fallback pour le téléphone
3. ✅ Utiliser `timestamps.session_start` pour afficher une date de parcours
4. ⚠️ Masquer l'adresse si elle n'est pas disponible (ou afficher "Logement non renseigné")
5. ⚠️ Afficher "Date du parcours" au lieu de "Séjour du X au Y" si les dates de séjour ne sont pas disponibles

---

## 📝 Champs à Modifier

### Fichiers à Modifier :
1. **`src/services/rapportDataMapper.ts`** - Fonction `mapToRapportSynthese()`
2. **`src/components/rapport/RapportSynthese.tsx`** - Affichage conditionnel

