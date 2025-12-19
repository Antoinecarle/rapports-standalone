# Système de Versioning de l'Application

## Vue d'ensemble

L'application dispose d'un système de versioning dynamique qui permet de basculer entre différentes versions de l'API en fonction d'un paramètre d'URL.

## Utilisation

### Paramètre d'URL

Ajoutez le paramètre `?version=` à l'URL pour spécifier la version à utiliser :

- **Version Test** : `https://votre-domaine.com/?version=test`
  - Utilise les endpoints : `https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf`
  
- **Version Live** : `https://votre-domaine.com/?version=live`
  - Utilise les endpoints : `https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf`

### Version par défaut

Si aucun paramètre `?version=` n'est spécifié, l'application utilise la version **test** par défaut.

## Architecture

### Configuration centralisée

Le fichier `src/config/api.config.ts` contient la configuration centralisée qui :

1. Détecte automatiquement le paramètre `?version=` dans l'URL
2. Configure tous les services API pour utiliser la bonne version
3. Fournit des helpers pour construire les URLs d'API

### Services concernés

Tous les services API utilisent cette configuration centralisée :

- **fullDataService** : Récupère les données complètes du rapport
- **aiDataService** : Récupère les données d'analyse IA
- **signalementsService** : Récupère les signalements
- **mydataService** : Récupère les données brutes du parcours

### Exemple d'utilisation dans le code

```typescript
import { apiConfig } from '@/config/api.config';

// Construire une URL d'endpoint
const url = apiConfig.buildUrl('rapportfulldata', { rapport: rapportId });

// Récupérer la version actuelle
const version = apiConfig.getVersion(); // 'test' ou 'live'

// Définir manuellement la version (pour les tests)
apiConfig.setVersion('live');
```

## Déploiement Railway

### Configuration

Le projet est configuré pour être déployé sur Railway avec :

- **Fichier de configuration** : `nixpacks.toml`
- **Fichiers ignorés** : `.railwayignore`
- **Domaine** : `rapports-app-production.up.railway.app`

### Variables d'environnement

Aucune variable d'environnement n'est requise pour le système de versioning, car la version est détectée automatiquement depuis l'URL.

### Build et déploiement

Le déploiement se fait automatiquement via Railway lorsque vous poussez sur la branche principale :

```bash
git add .
git commit -m "Update application"
git push origin main
```

Railway détectera automatiquement les changements et déclenchera un nouveau déploiement.

## Tests

### Tester localement

1. Démarrer l'application en mode développement :
   ```bash
   npm run dev
   ```

2. Accéder à l'application avec différentes versions :
   - Test : `http://localhost:8080/?version=test`
   - Live : `http://localhost:8080/?version=live`

3. Vérifier dans la console du navigateur que la bonne version est utilisée :
   ```
   [ApiConfig] Version détectée depuis l'URL: test
   ```

### Tester en production

1. Accéder à l'application déployée :
   - Test : `https://rapports-app-production.up.railway.app/?version=test`
   - Live : `https://rapports-app-production.up.railway.app/?version=live`

2. Vérifier dans la console du navigateur que les appels API utilisent la bonne version

## Maintenance

### Ajouter un nouveau service API

Si vous ajoutez un nouveau service qui doit appeler l'API :

1. Importer la configuration :
   ```typescript
   import { apiConfig } from '@/config/api.config';
   ```

2. Utiliser `apiConfig.buildUrl()` pour construire les URLs :
   ```typescript
   const url = apiConfig.buildUrl('mon-endpoint', { param: 'value' });
   ```

### Changer la version par défaut

Pour changer la version par défaut, modifier le fichier `src/config/api.config.ts` :

```typescript
private version: ApiVersion = 'live'; // Changer 'test' en 'live'
```

## Dépannage

### La version ne change pas

1. Vérifier que le paramètre `?version=` est bien présent dans l'URL
2. Vérifier dans la console du navigateur les logs `[ApiConfig]`
3. Rafraîchir la page après avoir changé le paramètre

### Les appels API échouent

1. Vérifier que l'endpoint existe pour la version spécifiée
2. Vérifier dans l'onglet Network du navigateur l'URL appelée
3. Vérifier que l'API backend est accessible

## Support

Pour toute question ou problème, consulter la documentation technique ou contacter l'équipe de développement.

