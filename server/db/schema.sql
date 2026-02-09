-- catalog_item: Master parts catalog
CREATE TABLE IF NOT EXISTS catalog_item (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  description TEXT DEFAULT '',
  manufacturer TEXT DEFAULT '',
  mpn TEXT DEFAULT '',
  package_type TEXT DEFAULT '',
  datasheet_url TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  pins TEXT DEFAULT '[]',
  specs TEXT DEFAULT '{}',
  ai_confidence REAL DEFAULT 0.0,
  ai_provider TEXT DEFAULT '',
  needs_review INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- inventory_lot: Physical stock tied to catalog items + locations
CREATE TABLE IF NOT EXISTS inventory_lot (
  id TEXT PRIMARY KEY,
  catalog_id TEXT NOT NULL REFERENCES catalog_item(id) ON DELETE CASCADE,
  location_id TEXT REFERENCES location(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  notes TEXT DEFAULT '',
  voice_note_url TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- location: Hierarchical storage (bins, drawers, shelves)
CREATE TABLE IF NOT EXISTS location (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES location(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  qr_code TEXT DEFAULT '',
  path TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- stock_move: Immutable audit trail of quantity changes
CREATE TABLE IF NOT EXISTS stock_move (
  id TEXT PRIMARY KEY,
  lot_id TEXT NOT NULL REFERENCES inventory_lot(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_lot_catalog ON inventory_lot(catalog_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lot_location ON inventory_lot(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_move_lot ON stock_move(lot_id);
CREATE INDEX IF NOT EXISTS idx_catalog_item_type ON catalog_item(type);
CREATE INDEX IF NOT EXISTS idx_catalog_item_needs_review ON catalog_item(needs_review);
CREATE INDEX IF NOT EXISTS idx_location_parent ON location(parent_id);

-- Full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS catalog_fts USING fts5(
  name, description, manufacturer, mpn, package_type,
  content='catalog_item',
  content_rowid='rowid'
);

-- FTS triggers for auto-sync
CREATE TRIGGER IF NOT EXISTS catalog_fts_insert AFTER INSERT ON catalog_item BEGIN
  INSERT INTO catalog_fts(rowid, name, description, manufacturer, mpn, package_type)
  VALUES (new.rowid, new.name, new.description, new.manufacturer, new.mpn, new.package_type);
END;

CREATE TRIGGER IF NOT EXISTS catalog_fts_delete AFTER DELETE ON catalog_item BEGIN
  INSERT INTO catalog_fts(catalog_fts, rowid, name, description, manufacturer, mpn, package_type)
  VALUES ('delete', old.rowid, old.name, old.description, old.manufacturer, old.mpn, old.package_type);
END;

CREATE TRIGGER IF NOT EXISTS catalog_fts_update AFTER UPDATE ON catalog_item BEGIN
  INSERT INTO catalog_fts(catalog_fts, rowid, name, description, manufacturer, mpn, package_type)
  VALUES ('delete', old.rowid, old.name, old.description, old.manufacturer, old.mpn, old.package_type);
  INSERT INTO catalog_fts(rowid, name, description, manufacturer, mpn, package_type)
  VALUES (new.rowid, new.name, new.description, new.manufacturer, new.mpn, new.package_type);
END;
