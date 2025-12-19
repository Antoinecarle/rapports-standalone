# Application Rapports - Standalone

Cette application est une version autonome de la page des rapports extraite du projet Guide Ton S.

## 🚀 Installation

```bash
npm install
```

## 💻 Développement

Pour lancer l'application en mode développement :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:8080`

## 🏗️ Build

Pour créer une version de production :

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`

## 👀 Preview

Pour prévisualiser la version de production :

```bash
npm run preview
```

## 📦 Contenu

Cette application standalone contient :

- **Vue détaillée de rapport** : Affichage plein écran d'un rapport avec toutes ses sections
- **Composants UI** : Uniquement les composants nécessaires (Button, Card, Badge, Dialog, etc.)
- **Données mock** : Données de démonstration intégrées
- **Dialogues interactifs** : Modification de photos, signalements, etc.

## 🎨 Fonctionnalités

- ✅ Affichage plein écran d'un rapport détaillé
- ✅ Synthèse du rapport avec notes et informations générales
- ✅ Détail par pièce avec accordéons interactifs
- ✅ Remarques générales avec filtres et recherche
- ✅ Suggestions IA
- ✅ Check final
- ✅ Dialogues de modification de photos de référence
- ✅ Gestion des signalements et consignes IA
- ✅ Affichage responsive (desktop et mobile)

## 🛠️ Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Lucide React (icônes)

## 📝 Notes

Cette application est complètement autonome et ne dépend pas du reste du projet Guide Ton S.
Toutes les données sont mockées pour la démonstration.

L'application a été optimisée pour contenir uniquement les composants nécessaires à l'affichage du rapport détaillé :
- **Taille du bundle JS** : ~371 kB (gzip: ~112 kB)
- **Taille du CSS** : ~34.6 kB (gzip: ~6.9 kB)
- **Composants UI** : 18 composants (au lieu de 49 initialement)
- **Dépendances** : 18 packages (au lieu de 22 initialement)
- **Total packages installés** : 207 (incluant les dépendances transitives)

