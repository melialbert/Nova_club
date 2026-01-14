const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Chercher la base de données dans différents emplacements possibles
const possiblePaths = [
  path.join(__dirname, 'desktop/data/club_management.db'),
  path.join(__dirname, 'data/club_management.db'),
];

let dbPath = null;
for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    dbPath = possiblePath;
    break;
  }
}

if (!dbPath) {
  console.error('\nErreur: La base de données n\'existe pas encore!');
  console.error('Veuillez démarrer l\'application au moins une fois pour créer la base de données.');
  console.error('Ensuite, relancez ce script de correction.\n');
  console.error('Emplacements recherchés:');
  possiblePaths.forEach(p => console.error('  -', p));
  process.exit(1);
}

console.log('Ouverture de la base de données:', dbPath);
const db = new Database(dbPath);

try {
  // Vérifier si la colonne existe
  const columns = db.pragma("table_info(clubs)").map(col => col.name);
  console.log('Colonnes actuelles:', columns);

  if (!columns.includes('language')) {
    console.log('Ajout de la colonne language...');
    db.exec("ALTER TABLE clubs ADD COLUMN language TEXT DEFAULT 'fr'");
    console.log('✓ Colonne language ajoutée avec succès!');
  } else {
    console.log('✓ La colonne language existe déjà');
  }

  // Vérifier le résultat
  const updatedColumns = db.pragma("table_info(clubs)").map(col => col.name);
  console.log('Colonnes après correction:', updatedColumns);

} catch (error) {
  console.error('Erreur:', error);
} finally {
  db.close();
  console.log('\nFermez et relancez complètement l\'application maintenant.');
}
