const fs = require('fs');

const data = JSON.parse(fs.readFileSync('dataia_debug.json', 'utf8'));

console.log('=== STRUCTURE DATA.JSON ===');
console.log('Keys:', Object.keys(data));

if (data.pieces) {
  console.log('\n=== PIECES ===');
  data.pieces.forEach(p => {
    console.log('\nPiece:', p.nom, '| ID:', p.id);
    if (p.tachesValidees) {
      console.log('Tâches validées:');
      p.tachesValidees.forEach(t => {
        console.log('  -', t.nom);
        console.log('    etapeId:', t.etapeId || 'NON DÉFINI');
      });
    }
  });
}

if (data.piecesWithRawData) {
  console.log('\n=== PIECES WITH RAW DATA ===');
  data.piecesWithRawData.forEach(p => {
    console.log('\nPiece:', p.nom, '| ID:', p.id);
    if (p.tachesValidees) {
      console.log('Tâches validées:');
      p.tachesValidees.forEach(t => {
        console.log('  -', t.nom);
        console.log('    etapeId:', t.etapeId || 'NON DÉFINI');
      });
    }
  });
}

