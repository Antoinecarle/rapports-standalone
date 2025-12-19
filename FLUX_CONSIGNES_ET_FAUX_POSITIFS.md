# 🔄 Flux des Consignes IA et Faux Positifs

## Comment ça fonctionne maintenant

### 1️⃣ Quand vous ajoutez une consigne IA

```
Utilisateur clique sur "Ajouter une consigne"
         ↓
Remplit le formulaire (texte + type: ignorer/surveiller)
         ↓
Clique sur "Ajouter"
         ↓
L'application appelle l'API Bubble:
POST /endpointrapportform
{
  "rapportId": "...",
  "userId": "...",
  "actions": [{
    "actionType": "CREATE_CONSIGNE_IA",
    "data": {
      "piece": "1760692946881x362790113660895200",
      "probleme": "Titre du problème" (ou null),
      "consigne": "Texte de la consigne",
      "type": "ignorer" | "surveiller"
    }
  }]
}
         ↓
Bubble.io enregistre la consigne dans la base de données
         ↓
L'application rafraîchit automatiquement les données
         ↓
La nouvelle consigne apparaît dans la section "Consignes enregistrées"
```

### 2️⃣ Quand vous marquez un problème comme faux positif

```
Utilisateur clique sur "Marquer comme faux" sur un problème
         ↓
Confirme l'action
         ↓
L'application appelle l'API Bubble:
POST /endpointrapportform
{
  "rapportId": "...",
  "userId": "...",
  "actions": [{
    "actionType": "MARK_FALSE_POSITIVE",
    "data": {
      "piece": "1760692946881x362790113660895200",
      "probleme": "Titre du problème"
    }
  }]
}
         ↓
Bubble.io enregistre le faux positif dans la base de données
         ↓
L'application rafraîchit automatiquement les données
         ↓
Le problème est marqué comme faux et grisé/masqué
```

## 📊 Affichage des données

### Consignes IA

Les consignes sont récupérées depuis l'endpoint `/signalementlist` :

```json
{
  "response": {
    "consigneIA": [
      {
        "_id": "...",
        "Commentaire": "Texte de la consigne",
        "os_consigneType": "ignorer" | "surveiller",
        "Piece": "ID de la pièce",
        "Created Date": 1760693170605
      }
    ]
  }
}
```

Elles sont affichées dans chaque pièce avec :
- Badge "🔕 À ignorer" (gris) pour type "ignorer"
- Badge "⚠️ À surveiller" (orange) pour type "surveiller"
- Date de création formatée

### Faux Positifs

Les faux positifs seront récupérés depuis le même endpoint (à implémenter dans Bubble) :

```json
{
  "response": {
    "fauxPositifs": [
      {
        "_id": "...",
        "piece": "ID de la pièce",
        "probleme": "Titre du problème",
        "Created Date": 1760693170605
      }
    ]
  }
}
```

Les problèmes marqués comme faux seront grisés ou masqués dans l'interface.

## 🔧 Configuration Bubble.io requise

### Pour les Consignes IA (✅ Déjà fait)

1. Endpoint `/signalementlist` retourne `consigneIA[]`
2. Endpoint `/endpointrapportform` accepte l'action `CREATE_CONSIGNE_IA`

### Pour les Faux Positifs (⏳ À faire)

1. Créer une table `FauxPositif` dans Bubble
2. Modifier `/signalementlist` pour retourner `fauxPositifs[]`
3. Modifier `/endpointrapportform` pour accepter l'action `MARK_FALSE_POSITIVE`

## 🎯 Résumé

**Avant** : Les consignes et faux positifs étaient stockés dans localStorage (données locales, perdues au rafraîchissement)

**Maintenant** : 
- Les consignes IA sont envoyées à l'API Bubble et sauvegardées en base de données
- L'application rafraîchit automatiquement après chaque action
- Les données sont persistantes et partagées entre tous les utilisateurs
- Les faux positifs utilisent le même système (code prêt, configuration Bubble à finaliser)

