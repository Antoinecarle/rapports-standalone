import fs from 'fs';

const mydata = JSON.parse(fs.readFileSync('mydata.json', 'utf8'));
const aidata = JSON.parse(fs.readFileSync('data.json', 'utf8'));

console.log('=== ANALYSE DES PHOTOS DE SORTIE ===\n');

aidata.detailParPieceSection.forEach(piece => {
  console.log(`\n=== PIECE: ${piece.nom} (${piece.id}) ===`);
  console.log(`Photos de sortie dans data.json: ${piece.checkSortie.photosSortie.length}`);

  piece.checkSortie.photosSortie.forEach((url, index) => {
    console.log(`  [${index + 1}] ${url}`);
  });

  // Chercher dans mydata les photos qui correspondent
  const mydataPiece = mydata.checkin.pieces.find(p => p.piece_id === piece.id);

  if (mydataPiece) {
    console.log(`\nÉtapes dans mydata.json: ${mydataPiece.etapes.length}`);

    // Récupérer toutes les photos de type checkout
    const photosCheckout = [];

    mydataPiece.etapes.forEach(etape => {
      // Vérifier si l'étape a une photo et est de type checkout
      const hasPhoto = etape.photo_url || etape.photo_base64;

      if (hasPhoto && etape.etape_type === 'checkout') {
        photosCheckout.push({
          etape_id: etape.etape_id,
          type: etape.type,
          photo_url: etape.photo_url || '(base64)',
          is_todo: etape.is_todo,
          timestamp: etape.timestamp
        });
      }
    });

    console.log(`\nPhotos checkout dans mydata.json: ${photosCheckout.length}`);

    // Grouper par etape_id pour détecter les doublons
    const groupedByEtapeId = {};
    photosCheckout.forEach(photo => {
      if (!groupedByEtapeId[photo.etape_id]) {
        groupedByEtapeId[photo.etape_id] = [];
      }
      groupedByEtapeId[photo.etape_id].push(photo);
    });

    console.log(`Photos uniques (par etape_id): ${Object.keys(groupedByEtapeId).length}`);

    // Afficher les doublons
    Object.keys(groupedByEtapeId).forEach(etapeId => {
      const photos = groupedByEtapeId[etapeId];
      if (photos.length > 1) {
        console.log(`\n⚠️  DOUBLON: etape_id ${etapeId} (${photos.length} occurrences)`);
        photos.forEach((photo, index) => {
          const urlPreview = photo.photo_url.substring(0, 60);
          console.log(`  [${index + 1}] type: ${photo.type}, is_todo: ${photo.is_todo}, URL: ${urlPreview}...`);
        });
      }
    });
  }
});

