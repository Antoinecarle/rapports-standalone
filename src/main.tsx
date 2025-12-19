import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Importer les utilitaires de test du versioning en développement
if (import.meta.env.DEV) {
  import('./utils/versionTest').then(module => {
    console.log('🔧 Mode développement : Utilitaires de test du versioning chargés');
    console.log('💡 Tapez versionTest.runAll() dans la console pour tester le système de versioning');
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

