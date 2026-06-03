CREATE TABLE IF NOT EXISTS moods (
    mood_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    mood TEXT NOT NULL,
    mood_type TEXT CHECK (mood_type IN ('positive', 'negative', 'neutral')),
    notes TEXT,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
