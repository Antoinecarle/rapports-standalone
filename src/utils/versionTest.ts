/**
 * Utilitaire de test pour le système de versioning
 * Ce fichier peut être utilisé pour tester manuellement le système de versioning
 */

import { apiConfig } from '@/config/api.config';

/**
 * Affiche les informations de configuration actuelle dans la console
 */
export function logVersionInfo(): void {
  console.group('🔧 Configuration API');
  console.log('Version actuelle:', apiConfig.getVersion());
  console.log('URL de base:', apiConfig.getApiBaseUrl());
  console.log('URL complète exemple:', apiConfig.buildUrl('rapportfulldata', { rapport: 'test-123' }));
  console.groupEnd();
}

/**
 * Teste le changement de version
 */
export function testVersionSwitch(): void {
  console.group('🧪 Test de changement de version');
  
  // Version initiale
  console.log('Version initiale:', apiConfig.getVersion());
  console.log('URL:', apiConfig.getApiBaseUrl());
  
  // Changer vers live
  apiConfig.setVersion('live');
  console.log('Après changement vers live:', apiConfig.getVersion());
  console.log('URL:', apiConfig.getApiBaseUrl());
  
  // Changer vers test
  apiConfig.setVersion('test');
  console.log('Après changement vers test:', apiConfig.getVersion());
  console.log('URL:', apiConfig.getApiBaseUrl());
  
  console.groupEnd();
}

/**
 * Teste la construction d'URLs pour différents endpoints
 */
export function testUrlBuilding(): void {
  console.group('🔗 Test de construction d\'URLs');
  
  const endpoints = [
    { name: 'rapportfulldata', params: { rapport: '123' } },
    { name: 'rapportdataia', params: { rapport: '456' } },
    { name: 'signalementlist', params: { rapportid: '789' } },
    { name: 'rapportdata', params: { rapport: 'abc' } },
  ];
  
  endpoints.forEach(({ name, params }) => {
    const url = apiConfig.buildUrl(name, params);
    console.log(`${name}:`, url);
  });
  
  console.groupEnd();
}

/**
 * Vérifie que le paramètre d'URL est correctement détecté
 */
export function checkUrlParameter(): void {
  console.group('🔍 Vérification du paramètre d\'URL');
  
  const urlParams = new URLSearchParams(window.location.search);
  const versionParam = urlParams.get('version');
  const detectedVersion = apiConfig.getVersion();
  
  console.log('Paramètre URL "version":', versionParam || 'non spécifié');
  console.log('Version détectée:', detectedVersion);
  console.log('Correspondance:', versionParam === detectedVersion || (versionParam === null && detectedVersion === 'test'));
  
  console.groupEnd();
}

/**
 * Lance tous les tests
 */
export function runAllTests(): void {
  console.clear();
  console.log('🚀 Lancement des tests du système de versioning\n');
  
  logVersionInfo();
  console.log('');
  
  checkUrlParameter();
  console.log('');
  
  testUrlBuilding();
  console.log('');
  
  testVersionSwitch();
  console.log('');
  
  console.log('✅ Tests terminés');
}

// Exposer les fonctions de test dans la console pour un accès facile
if (typeof window !== 'undefined') {
  (window as any).versionTest = {
    logInfo: logVersionInfo,
    testSwitch: testVersionSwitch,
    testUrls: testUrlBuilding,
    checkUrl: checkUrlParameter,
    runAll: runAllTests,
  };
  
  console.log('💡 Fonctions de test disponibles dans window.versionTest:');
  console.log('  - versionTest.logInfo()     : Affiche les infos de configuration');
  console.log('  - versionTest.testSwitch()  : Teste le changement de version');
  console.log('  - versionTest.testUrls()    : Teste la construction d\'URLs');
  console.log('  - versionTest.checkUrl()    : Vérifie le paramètre d\'URL');
  console.log('  - versionTest.runAll()      : Lance tous les tests');
}

