CREATE TYPE star_rating AS ENUM (
    '1',
    '2',
    '3',
    '4',
    '5'
);

ALTER TABLE bookmarks
    ADD COLUMN
        rating star_rating NOT NULL;

