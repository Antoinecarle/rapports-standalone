import fs from 'fs';

const mydata = JSON.parse(fs.readFileSync('mydata.json', 'utf8'));
const aidata = JSON.parse(fs.readFileSync('data.json', 'utf8'));

console.log('=== ANALYSE DES PHOTOS INITIALES (RÉFÉRENCE) ===\n');

aidata.detailParPieceSection.forEach(piece => {
  console.log(`\n=== PIECE: ${piece.nom} (${piece.id}) ===`);
  console.log(`Photos de référence dans data.json: ${piece.photosReference.length}`);
  
  piece.photosReference.forEach((url, index) => {
    console.log(`  [${index + 1}] ${url}`);
  });
  
  // Chercher dans mydata les photos qui correspondent
  const mydataPiece = mydata.checkin.pieces.find(p => p.piece_id === piece.id);
  
  if (mydataPiece) {
    console.log(`\nÉtapes dans mydata.json: ${mydataPiece.etapes.length}`);
    
    // Compter les photos par type d'étape
    const photosByType = {
      checkin: [],
      checkout: [],
      other: []
    };
    
    mydataPiece.etapes.forEach(etape => {
      // Vérifier si l'étape a une photo
      const hasPhoto = etape.photo_url || etape.photo_base64;
      
      if (hasPhoto) {
        const type = etape.etape_type || 'other';
        photosByType[type].push({
          etape_id: etape.etape_id,
          type: etape.type,
          photo_url: etape.photo_url || '(base64)',
          is_todo: etape.is_todo
        });
      }
    });
    
    console.log(`\nPhotos par type d'étape:`);
    console.log(`  - checkin: ${photosByType.checkin.length}`);
    console.log(`  - checkout: ${photosByType.checkout.length}`);
    console.log(`  - other: ${photosByType.other.length}`);
    
    if (photosByType.checkin.length > 0) {
      console.log(`\nDétail des photos checkin:`);
      photosByType.checkin.forEach((photo, index) => {
        console.log(`  [${index + 1}] etape_id: ${photo.etape_id}, type: ${photo.type}, is_todo: ${photo.is_todo}`);
        console.log(`      URL: ${photo.photo_url.substring(0, 80)}...`);
      });
    }
  }
});

