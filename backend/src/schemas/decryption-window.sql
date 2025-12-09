CREATE TABLE IF NOT EXISTS decryptionWindow (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    expiary TIMESTAMP NOT NULL,
    userId TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_decryptionWindow_userId ON decryptionWindow(userId);
CREATE INDEX IF NOT EXISTS idx_decryptionWindow_expiary ON decryptionWindow(expiary);
