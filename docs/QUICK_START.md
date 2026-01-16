# 🚀 Guide de Démarrage Rapide

## ⚡ Test Local Immédiat

### 1. Démarrer l'application

```bash
cd rapports-standalone
npm run dev
```

### 2. Tester les versions

Ouvrez votre navigateur et testez :

- **Version TEST** : http://localhost:8080/?version=test
- **Version LIVE** : http://localhost:8080/?version=live
- **Sans paramètre** (défaut = test) : http://localhost:8080/

### 3. Vérifier dans la console

Ouvrez la console du navigateur (F12) et vous devriez voir :

```
[ApiConfig] Version détectée depuis l'URL: test
🔧 Mode développement : Utilitaires de test du versioning chargés
💡 Tapez versionTest.runAll() dans la console pour tester le système de versioning
```

### 4. Lancer les tests automatiques

Dans la console du navigateur, tapez :

```javascript
versionTest.runAll()
```

Vous verrez tous les tests s'exécuter et vérifier que le système fonctionne correctement.

## 🌐 Déploiement sur Railway

### Option 1 : Déploiement automatique (Recommandé)

Le service Railway est déjà configuré pour déployer automatiquement à chaque push sur `main` :

```bash
# 1. Commiter vos changements
git add .
git commit -m "Setup versioning system"

# 2. Pousser sur GitHub
git push origin main

# 3. Railway déploiera automatiquement !
```

### Option 2 : Déploiement manuel via Railway CLI

Si vous avez installé Railway CLI :

```bash
cd rapports-standalone
railway up
```

## 🔗 URLs de Production

Une fois déployé, votre application sera accessible sur :

- **Version TEST** : https://rapports-app-production.up.railway.app/?version=test
- **Version LIVE** : https://rapports-app-production.up.railway.app/?version=live

## 📊 Vérifier le Déploiement

### 1. Dashboard Railway

Accédez au dashboard : https://railway.app/project/c5f921c4-4071-459a-9f23-79a2ae08df63

Vérifiez :
- ✅ Le build s'est terminé sans erreur
- ✅ Le service est en cours d'exécution
- ✅ Aucune erreur dans les logs

### 2. Test de l'application

1. Ouvrez l'URL de production
2. Ouvrez la console du navigateur (F12)
3. Vérifiez les logs de configuration
4. Testez avec `?version=test` et `?version=live`

## 🛠️ Commandes Utiles

```bash
# Développement local
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview

# Vérifier les erreurs TypeScript
npx tsc --noEmit
```

## 📁 Fichiers Importants

- **Configuration API** : `src/config/api.config.ts`
- **Tests** : `src/utils/versionTest.ts`
- **Config Railway** : `nixpacks.toml`
- **Fichiers ignorés** : `.railwayignore`

## 🐛 Dépannage Rapide

### Le build échoue

```bash
# Nettoyer et réinstaller
rm -rf node_modules dist
npm install
npm run build
```

### La version ne change pas

1. Vérifiez que l'URL contient bien `?version=test` ou `?version=live`
2. Rafraîchissez la page (Ctrl+F5)
3. Vérifiez la console pour les logs `[ApiConfig]`

### Les appels API échouent

1. Vérifiez la console pour voir les URLs appelées
2. Vérifiez que l'endpoint existe pour la version spécifiée
3. Vérifiez les CORS si vous êtes en développement local

## 📚 Documentation Complète

Pour plus de détails, consultez :

- **`SETUP_COMPLETE.md`** : Récapitulatif complet de la configuration
- **`VERSIONING.md`** : Guide détaillé du système de versioning
- **`DEPLOYMENT.md`** : Guide complet de déploiement Railway

## ✅ Checklist de Vérification

Avant de déployer en production, vérifiez :

- [ ] Le build local fonctionne (`npm run build`)
- [ ] Les tests de versioning passent (`versionTest.runAll()`)
- [ ] L'application fonctionne avec `?version=test`
- [ ] L'application fonctionne avec `?version=live`
- [ ] Les appels API utilisent les bonnes URLs
- [ ] Aucune erreur dans la console

## 🎯 Prochaines Étapes

1. **Tester localement** avec les deux versions
2. **Commiter et pousser** sur GitHub
3. **Vérifier le déploiement** sur Railway
4. **Tester en production** avec les deux versions
5. **Configurer un domaine personnalisé** (optionnel)

## 💡 Astuces

- Utilisez `versionTest.logInfo()` pour voir rapidement la configuration actuelle
- Les logs `[ApiConfig]` dans la console vous indiquent quelle version est utilisée
- En développement, les utilitaires de test sont automatiquement chargés
- Le paramètre `?version=` est persistant dans l'URL, vous pouvez le partager

## 🎉 C'est Tout !

Votre système de versioning est prêt à l'emploi. Bon développement ! 🚀

