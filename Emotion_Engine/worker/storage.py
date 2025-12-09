import sqlite3
import os

class KeyStorage:
    def __init__(self, db_path="keys.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS decryption_keys (
                    uid TEXT PRIMARY KEY,
                    key TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    def save_key(self, uid: str, key: str):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO decryption_keys (uid, key)
                    VALUES (?, ?)
                """, (uid, key))
                conn.commit()
            return True
        except Exception as e:
            print(f"Error saving key: {e}")
            return False

    def get_key(self, uid: str):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT key FROM decryption_keys WHERE uid = ?", (uid,))
                result = cursor.fetchone()
                return result[0] if result else None
        except Exception as e:
            print(f"Error retrieving key: {e}")
            return None
