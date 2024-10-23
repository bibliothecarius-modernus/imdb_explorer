CREATE TABLE IF NOT EXISTS watched_movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imdb_id TEXT NOT NULL,
    title TEXT NOT NULL,
    year INTEGER,
    director TEXT,
    writers TEXT,
    actors TEXT,
    genre TEXT,
    runtime INTEGER,
    rating REAL,
    plot TEXT,
    poster_url TEXT,
    watch_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_imdb_id ON watched_movies(imdb_id);
CREATE INDEX IF NOT EXISTS idx_watch_date ON watched_movies(watch_date);
CREATE INDEX IF NOT EXISTS idx_director ON watched_movies(director);