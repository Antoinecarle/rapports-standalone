const fs = require('fs');

// Charger les données
const mydata = JSON.parse(fs.readFileSync('mydata.json', 'utf8'));
const aidata = JSON.parse(fs.readFileSync('data.json', 'utf8'));

console.log('=== ANALYSE DES PHOTOS ===\n');

// Analyser chaque pièce
mydata.checkin.pieces.forEach(piece => {
  console.log(`\n=== PIECE: ${piece.piece_name} (${piece.piece_id}) ===`);
  
  // Trouver les données IA correspondantes
  const aiPiece = aidata.detailParPieceSection.find(p => p.id === piece.piece_id);
  
  if (aiPiece) {
    console.log(`Tâches validées dans data.json: ${aiPiece.tachesValidees.length}`);
    aiPiece.tachesValidees.forEach(tache => {
      console.log(`  - ${tache.nom} (etapeId: ${tache.etapeId})`);
    });
  }
  
  // Compter les étapes avec photos
  const etapesAvecPhotos = piece.etapes.filter(e => e.photo_url || e.photo_base64);
  console.log(`\nÉtapes avec photos dans mydata.json: ${etapesAvecPhotos.length}`);
  
  etapesAvecPhotos.forEach(e => {
    console.log(`  - Type: ${e.type}, is_todo: ${e.is_todo}, etape_id: ${e.etape_id}`);
    if (e.todo_title) {
      console.log(`    todo_title: ${e.todo_title.substring(0, 50)}...`);
    }
  });
  
  // Vérifier les correspondances
  if (aiPiece) {
    console.log(`\n--- Correspondances etapeId ---`);
    aiPiece.tachesValidees.forEach(tache => {
      const etape = piece.etapes.find(e => e.etape_id === tache.etapeId);
      if (etape) {
        const hasPhoto = !!(etape.photo_url || etape.photo_base64);
        console.log(`  ✓ ${tache.etapeId} -> Photo: ${hasPhoto ? 'OUI' : 'NON'}, Type: ${etape.type}`);
      } else {
        console.log(`  ✗ ${tache.etapeId} -> ÉTAPE NON TROUVÉE`);
      }
    });
  }
});

console.log('\n\n=== RÉSUMÉ GLOBAL ===');
const totalPhotos = mydata.checkin.pieces.reduce((sum, piece) => {
  return sum + piece.etapes.filter(e => e.photo_url || e.photo_base64).length;
}, 0);
console.log(`Total d'étapes avec photos: ${totalPhotos}`);

