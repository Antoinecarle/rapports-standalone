# Guide de Déploiement Railway

## Configuration du Projet

### Informations du projet Railway

- **Nom du projet** : checkeasy rapport page
- **ID du projet** : c5f921c4-4071-459a-9f23-79a2ae08df63
- **Service** : rapports-app
- **ID du service** : 3e8ac452-f347-4e1a-8b39-8ff780185e1f
- **Environnement** : production
- **Domaine** : https://rapports-app-production.up.railway.app

### Repository GitHub

- **Repository** : checkeasy/guide-ton-s
- **Répertoire racine** : rapports-standalone

## Fichiers de Configuration

### 1. nixpacks.toml

Ce fichier configure le processus de build sur Railway :

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

**Points clés** :
- Utilise Node.js 20
- Installe les dépendances avec `npm ci` (plus rapide et déterministe)
- Build l'application avec `npm run build`
- Lance le serveur de preview Vite sur le port fourni par Railway

### 2. .railwayignore

Ce fichier exclut les fichiers inutiles du déploiement :

```
node_modules/
.history/
.vscode/
docs/
mydata.json
*.log
```

**Avantages** :
- Réduit la taille du déploiement
- Accélère le processus de build
- Évite de déployer des données sensibles ou de test

## Processus de Déploiement

### Déploiement automatique

Railway est configuré pour déployer automatiquement à chaque push sur la branche `main` :

1. Faire vos modifications localement
2. Commiter les changements :
   ```bash
   git add .
   git commit -m "Description des changements"
   ```
3. Pousser sur GitHub :
   ```bash
   git push origin main
   ```
4. Railway détecte automatiquement le push et lance un nouveau déploiement

### Suivre le déploiement

Vous pouvez suivre le déploiement de plusieurs façons :

1. **Via le dashboard Railway** : https://railway.app/project/c5f921c4-4071-459a-9f23-79a2ae08df63

2. **Via les logs** : Consultez les logs de build et de runtime dans le dashboard Railway

## Vérification du Déploiement

### 1. Vérifier que le build réussit

Après le push, vérifiez dans le dashboard Railway que :
- Le build se termine sans erreur
- Le service démarre correctement
- Aucune erreur n'apparaît dans les logs

### 2. Tester l'application

Accédez à l'application déployée :

- **Version test** : https://rapports-app-production.up.railway.app/?version=test
- **Version live** : https://rapports-app-production.up.railway.app/?version=live

### 3. Vérifier les appels API

Ouvrez la console du navigateur (F12) et vérifiez :

1. Que la version est correctement détectée :
   ```
   [ApiConfig] Version détectée depuis l'URL: test
   ```

2. Que les appels API utilisent la bonne URL :
   ```
   [FullDataService] URL: https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/rapportfulldata?rapport=...
   ```

## Dépannage

### Le build échoue

1. **Vérifier les logs de build** dans le dashboard Railway
2. **Tester localement** :
   ```bash
   npm ci
   npm run build
   ```
3. **Vérifier les dépendances** dans `package.json`

### L'application ne démarre pas

1. **Vérifier les logs de runtime** dans le dashboard Railway
2. **Tester le serveur de preview localement** :
   ```bash
   npm run build
   npm run preview
   ```
3. **Vérifier le port** : Railway fournit automatiquement la variable `$PORT`

### Les appels API échouent

1. **Vérifier la configuration** dans `src/config/api.config.ts`
2. **Vérifier les CORS** : L'API backend doit autoriser les requêtes depuis le domaine Railway
3. **Vérifier les endpoints** : S'assurer que les endpoints existent pour la version spécifiée

## Commandes Utiles

### Build local

```bash
npm run build
```

### Preview local

```bash
npm run preview
```

### Développement local

```bash
npm run dev
```

## Variables d'Environnement

Actuellement, aucune variable d'environnement n'est requise car :
- La version est détectée depuis l'URL
- L'URL de base de l'API est hardcodée dans la configuration

Si vous souhaitez ajouter des variables d'environnement :

1. Aller dans le dashboard Railway
2. Sélectionner le service "rapports-app"
3. Aller dans l'onglet "Variables"
4. Ajouter vos variables

## Rollback

Si un déploiement pose problème :

1. Aller dans le dashboard Railway
2. Sélectionner le service "rapports-app"
3. Aller dans l'onglet "Deployments"
4. Cliquer sur "Rollback" sur un déploiement précédent

## Support

Pour toute question ou problème :
- Consulter la documentation Railway : https://docs.railway.app
- Consulter les logs dans le dashboard Railway
- Contacter l'équipe de développement

