const fs = require('fs');

const data = JSON.parse(fs.readFileSync('dataia_debug.json', 'utf8'));

console.log('=== STRUCTURE DATA.JSON ===');
console.log('Keys:', Object.keys(data));

if (data.detailParPieceSection) {
  console.log('\n=== DETAIL PAR PIECE SECTION ===');
  data.detailParPieceSection.forEach(p => {
    console.log('\nPiece:', p.nom, '| ID:', p.id);
    if (p.tachesValidees) {
      console.log('Tâches validées:', p.tachesValidees.length);
      p.tachesValidees.forEach(t => {
        console.log('  -', t.nom);
        console.log('    etapeId:', t.etapeId || 'NON DÉFINI');
      });
    }
  });
}

