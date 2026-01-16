# 🚂 Guide Railway CLI

## ✅ Configuration Actuelle

Le projet est maintenant configuré et lié à Railway via CLI :

- **Projet** : checkeasy rapport page
- **Environnement** : production
- **Service** : rapports-app
- **Domaine** : https://rapports-app-production.up.railway.app

## 📋 Commandes Railway CLI Essentielles

### Vérifier le statut

```bash
railway status
```

### Voir les variables d'environnement

```bash
railway variables
```

### Déployer l'application

```bash
# Déploiement avec suivi des logs
railway up

# Déploiement en arrière-plan
railway up --detach
```

### Voir les logs

```bash
# Logs en temps réel
railway logs

# Logs de build
railway logs --deployment
```

### Ouvrir l'application dans le navigateur

```bash
railway open
```

### Ouvrir le dashboard Railway

```bash
railway open --dashboard
```

### Gérer les domaines

```bash
# Voir les domaines existants
railway domain

# Ajouter un domaine personnalisé (si besoin)
railway domain add mon-domaine.com
```

### Gérer les variables d'environnement

```bash
# Ajouter une variable
railway variables set NOM_VARIABLE=valeur

# Supprimer une variable
railway variables delete NOM_VARIABLE
```

## 🚀 Workflow de Déploiement

### 1. Développement local

```bash
# Tester localement
npm run dev

# Tester avec différentes versions
# http://localhost:8080/?version=test
# http://localhost:8080/?version=live
```

### 2. Build local (optionnel)

```bash
# Vérifier que le build fonctionne
npm run build

# Tester le build localement
npm run preview
```

### 3. Déploiement sur Railway

```bash
# Déployer directement depuis les fichiers locaux
cd rapports-standalone
railway up --detach
```

### 4. Vérification

```bash
# Ouvrir l'application
railway open

# Ou accéder directement à :
# https://rapports-app-production.up.railway.app/?version=test
# https://rapports-app-production.up.railway.app/?version=live
```

## 📁 Fichiers de Configuration Railway

### railway.json

Configuration du service Railway :

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview -- --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### nixpacks.toml

Configuration de build Nixpacks :

```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run preview -- --host 0.0.0.0 --port $PORT"

[variables]
NODE_ENV = "production"
```

### .railwayignore

Fichiers à exclure du déploiement :

```
node_modules/
.history/
.vscode/
docs/
*.log
```

## 🔧 Commandes de Maintenance

### Redémarrer le service

```bash
railway restart
```

### Voir les informations du service

```bash
railway service
```

### Changer d'environnement

```bash
railway environment
```

### Se déconnecter

```bash
railway logout
```

### Se reconnecter

```bash
railway login
```

## 🐛 Dépannage

### Le déploiement échoue

1. Vérifier les logs de build :
   ```bash
   railway logs --deployment
   ```

2. Vérifier que le build fonctionne localement :
   ```bash
   npm run build
   ```

3. Vérifier les fichiers de configuration :
   - `nixpacks.toml`
   - `railway.json`
   - `package.json`

### L'application ne démarre pas

1. Vérifier les logs runtime :
   ```bash
   railway logs
   ```

2. Vérifier que le serveur de preview fonctionne localement :
   ```bash
   npm run build
   npm run preview
   ```

3. Vérifier que le port est correctement configuré (Railway fournit `$PORT`)

### Impossible de se connecter

```bash
railway logout
railway login
```

## 📊 Monitoring

### Voir l'utilisation des ressources

Ouvrir le dashboard :
```bash
railway open --dashboard
```

Dans le dashboard, vous pouvez voir :
- CPU et mémoire utilisés
- Nombre de requêtes
- Temps de réponse
- Logs en temps réel

## 🎯 Commandes Rapides

```bash
# Déployer rapidement
railway up --detach

# Voir les logs
railway logs

# Ouvrir l'app
railway open

# Redémarrer
railway restart

# Voir le statut
railway status
```

## 💡 Astuces

- Utilisez `--detach` pour déployer en arrière-plan
- Les logs sont disponibles en temps réel avec `railway logs`
- Le dashboard web offre plus de détails : `railway open --dashboard`
- Les variables d'environnement Railway sont automatiquement injectées
- Le domaine public est automatiquement configuré

## 🔗 Liens Utiles

- **Dashboard** : https://railway.app/project/c5f921c4-4071-459a-9f23-79a2ae08df63
- **Application** : https://rapports-app-production.up.railway.app
- **Documentation Railway** : https://docs.railway.app
- **Documentation Nixpacks** : https://nixpacks.com

## ✅ Checklist de Déploiement

Avant chaque déploiement :

- [ ] Le build local fonctionne (`npm run build`)
- [ ] Les tests de versioning passent (`versionTest.runAll()`)
- [ ] Les fichiers de configuration sont à jour
- [ ] Aucune donnée sensible dans le code
- [ ] Les dépendances sont à jour dans `package.json`

Après le déploiement :

- [ ] Vérifier les logs (`railway logs`)
- [ ] Tester l'application (`railway open`)
- [ ] Tester avec `?version=test`
- [ ] Tester avec `?version=live`
- [ ] Vérifier qu'il n'y a pas d'erreur dans la console du navigateur

