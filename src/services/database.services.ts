import Database from 'better-sqlite3'
import path from 'path'

class DatabaseService {
  private db: Database.Database

  constructor() {
    const dbPath = path.join(process.cwd(), 'dating.db')
    this.db = new Database(dbPath)

    this.db.pragma('foreign_keys = ON')

    console.log('Connected to SQLite database:', dbPath)

    this.initTables()
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        bio TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHECK (age >= 13 AND age <= 120),
        CHECK (gender IN ('male', 'female', 'other'))
      );
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user_id) REFERENCES profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (to_user_id) REFERENCES profiles(id) ON DELETE CASCADE,
        CHECK (from_user_id <> to_user_id),
        UNIQUE(from_user_id, to_user_id)
      );
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1_id INTEGER NOT NULL,
        user2_id INTEGER NOT NULL,
        matched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user1_id) REFERENCES profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (user2_id) REFERENCES profiles(id) ON DELETE CASCADE,
        CHECK (user1_id < user2_id),
        UNIQUE(user1_id, user2_id)
      );
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS availabilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        match_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
        CHECK (start_time < end_time),
        UNIQUE(user_id, match_id, date, start_time, end_time)
      );
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS dates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
        UNIQUE(match_id)
      );
    `)

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_likes_from ON likes(from_user_id);
      CREATE INDEX IF NOT EXISTS idx_likes_to ON likes(to_user_id);
      CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
      CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
      CREATE INDEX IF NOT EXISTS idx_avail_match_user ON availabilities(match_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_avail_match_date ON availabilities(match_id, date);
    `)

    console.log('Database tables initialized')
  }

  getDb() {
    return this.db
  }

  close() {
    this.db.close()
    console.log('Database connection closed')
  }
}

const databaseService = new DatabaseService()
export default databaseService
