const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const bcrypt = require('bcryptjs');

let db;

function getDbPath() {
  if (process.env.ELECTRON_MODE) {
    const userDataPath = app ? app.getPath('userData') : path.join(__dirname, '../../data');
    return path.join(userDataPath, 'club_management.db');
  }
  return path.join(__dirname, '../../data/club_management.db');
}

function initDatabase() {
  const dbPath = getDbPath();
  console.log('Database path:', dbPath);

  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Created database directory:', dbDir);
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  createTables();
  migrateMembersTable();
  createDefaultData();

  return db;
}

function migrateMembersTable() {
  const columns = db.pragma("table_info(members)").map(col => col.name);

  if (!columns.includes('gender')) {
    db.exec("ALTER TABLE members ADD COLUMN gender TEXT DEFAULT 'male'");
    console.log('Added gender column to members table');
  }

  if (!columns.includes('category')) {
    db.exec("ALTER TABLE members ADD COLUMN category TEXT");
    console.log('Added category column to members table');
  }

  if (!columns.includes('discipline')) {
    db.exec("ALTER TABLE members ADD COLUMN discipline TEXT");
    console.log('Added discipline column to members table');
  }

  if (!columns.includes('status')) {
    db.exec("ALTER TABLE members ADD COLUMN status TEXT DEFAULT 'active'");
    console.log('Added status column to members table');
  }

  if (!columns.includes('monthly_fee')) {
    db.exec("ALTER TABLE members ADD COLUMN monthly_fee REAL DEFAULT 0");
    console.log('Added monthly_fee column to members table');
  }

  if (!columns.includes('registration_date')) {
    db.exec("ALTER TABLE members ADD COLUMN registration_date DATE");
    console.log('Added registration_date column to members table');
  }
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'coach', 'member')),
      first_name TEXT,
      last_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth DATE,
      gender TEXT DEFAULT 'male',
      belt_level TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      photo_url TEXT,
      category TEXT,
      discipline TEXT,
      status TEXT DEFAULT 'active',
      monthly_fee REAL DEFAULT 0,
      registration_date DATE,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS attendances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      club_id INTEGER NOT NULL,
      date DATE NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'excused')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id),
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      club_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date DATE NOT NULL,
      payment_method TEXT,
      description TEXT,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id),
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      club_id INTEGER NOT NULL,
      license_number TEXT UNIQUE,
      issue_date DATE,
      expiry_date DATE,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id),
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      position TEXT,
      email TEXT,
      phone TEXT,
      salary REAL,
      hire_date DATE,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      category TEXT,
      amount REAL NOT NULL,
      description TEXT,
      transaction_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      condition TEXT,
      purchase_date DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER,
      subject TEXT,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id),
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (recipient_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS competitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      competition_type TEXT,
      location TEXT,
      competition_date DATE NOT NULL,
      description TEXT,
      level TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS member_competitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      competition_id INTEGER NOT NULL,
      rank_achieved INTEGER,
      weight_category TEXT,
      medal TEXT,
      points_earned INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id),
      FOREIGN KEY (competition_id) REFERENCES competitions(id),
      UNIQUE(member_id, competition_id)
    );

    CREATE TABLE IF NOT EXISTS career_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      event_date DATE NOT NULL,
      achievement_level TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    CREATE TABLE IF NOT EXISTS belt_promotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      club_id INTEGER NOT NULL,
      previous_belt TEXT NOT NULL,
      new_belt TEXT NOT NULL,
      promotion_date DATE NOT NULL,
      examiner TEXT,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id),
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );
  `);

  console.log('Tables created successfully');
}

function createDefaultData() {
  const clubExists = db.prepare('SELECT COUNT(*) as count FROM clubs').get();

  if (clubExists.count === 0) {
    const insertClub = db.prepare('INSERT INTO clubs (name, address, phone, email) VALUES (?, ?, ?, ?)');
    const result = insertClub.run('Mon Club de Judo', '123 Rue du Dojo', '0123456789', 'contact@club-judo.fr');
    const clubId = result.lastInsertRowid;

    const passwordHash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (club_id, email, password_hash, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)')
      .run(clubId, 'admin@club.fr', passwordHash, 'admin', 'Admin', 'Principal');

    console.log('Default club and admin user created');
    console.log('Login: admin@club.fr / admin123');
  }
}

function getDb() {
  if (!db) {
    initDatabase();
  }
  return db;
}

module.exports = {
  initDatabase,
  getDb
};
