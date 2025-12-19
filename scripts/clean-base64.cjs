/**
 * Script pour nettoyer les données base64 des fichiers JSON
 * Remplace les longues chaînes base64 par un placeholder pour réduire la taille
 */

const fs = require('fs');
const path = require('path');

/**
 * Nettoie les données base64 d'un objet JSON
 * @param {any} obj - L'objet à nettoyer
 * @param {number} maxLength - Longueur maximale à conserver (défaut: 100 caractères)
 * @returns {any} - L'objet nettoyé
 */
function cleanBase64(obj, maxLength = 100) {
  if (typeof obj === 'string') {
    // Détecter les chaînes base64 (commencent par "data:image/")
    if (obj.startsWith('data:image/')) {
      const parts = obj.split(',');
      if (parts.length === 2 && parts[1].length > maxLength) {
        // Garder le préfixe et un extrait du début
        const prefix = parts[0];
        const base64Preview = parts[1].substring(0, maxLength);
        return `${prefix},${base64Preview}...[BASE64_TRUNCATED_${parts[1].length}_CHARS]`;
      }
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanBase64(item, maxLength));
  }

  if (obj !== null && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanBase64(value, maxLength);
    }
    return cleaned;
  }

  return obj;
}

/**
 * Nettoie un fichier JSON
 * @param {string} inputPath - Chemin du fichier d'entrée
 * @param {string} outputPath - Chemin du fichier de sortie (optionnel)
 */
function cleanJsonFile(inputPath, outputPath = null) {
  try {
    console.log(`📖 Lecture du fichier: ${inputPath}`);
    
    // Lire le fichier
    let content = fs.readFileSync(inputPath, 'utf-8');
    
    // Nettoyer les valeurs undefined
    console.log('🧹 Nettoyage des valeurs undefined...');
    content = content
      .replace(/:\s*undefined\s*,/g, ': null,')
      .replace(/:\s*undefined\s*}/g, ': null}')
      .replace(/:\s*undefined\s*\]/g, ': null]');
    
    // Parser le JSON
    console.log('📝 Parsing du JSON...');
    const data = JSON.parse(content);
    
    // Nettoyer les base64
    console.log('✂️  Nettoyage des données base64...');
    const cleaned = cleanBase64(data);
    
    // Déterminer le chemin de sortie
    const output = outputPath || inputPath;
    
    // Écrire le fichier nettoyé
    console.log(`💾 Écriture du fichier nettoyé: ${output}`);
    fs.writeFileSync(output, JSON.stringify(cleaned, null, 2), 'utf-8');
    
    // Statistiques
    const originalSize = fs.statSync(inputPath).size;
    const cleanedSize = fs.statSync(output).size;
    const reduction = ((originalSize - cleanedSize) / originalSize * 100).toFixed(2);
    
    console.log('\n✅ Nettoyage terminé!');
    console.log(`📊 Taille originale: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`📊 Taille nettoyée: ${(cleanedSize / 1024).toFixed(2)} KB`);
    console.log(`📊 Réduction: ${reduction}%`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Utilisation en ligne de commande
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node clean-base64.js <input-file> [output-file]');
    console.log('');
    console.log('Exemples:');
    console.log('  node clean-base64.js public/mydata.json');
    console.log('  node clean-base64.js public/mydata.json public/mydata-clean.json');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1] || null;
  
  cleanJsonFile(inputFile, outputFile);
}

module.exports = { cleanBase64, cleanJsonFile };

