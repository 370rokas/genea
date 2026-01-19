DROP TRIGGER IF EXISTS location_path_update ON location;

DROP TRIGGER IF EXISTS location_update_descendants ON location;

CREATE TABLE IF NOT EXISTS source_category(
    id bigserial PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS location(
    id bigserial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    parent_id bigint REFERENCES location(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS source_tag(
    id bigserial PRIMARY KEY,
    name text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS source_submission(
    id bigserial PRIMARY KEY,
    submitted_at timestamptz NOT NULL DEFAULT NOW(),
    title text NOT NULL,
    description text,
    link text
);

CREATE TABLE IF NOT EXISTS source(
    id bigserial PRIMARY KEY,
    title text NOT NULL,
    description text,
    link text,
    category_id bigint REFERENCES source_category(id) ON DELETE SET NULL,
    search_vector tsvector
);

ALTER TABLE source
    ADD COLUMN IF NOT EXISTS title_en text;

ALTER TABLE source
    ADD COLUMN IF NOT EXISTS description_en text;

CREATE TABLE IF NOT EXISTS user_message(
    id bigserial PRIMARY KEY,
    message text NOT NULL,
    reply_to text,
    related_source_id bigint REFERENCES source(id) ON DELETE SET NULL,
    handled boolean NOT NULL DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification(
    id bigserial PRIMARY KEY,
    message text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    last_pushed_at timestamptz
);

CREATE TABLE IF NOT EXISTS notification_recipient(
    id bigserial PRIMARY KEY,
    email varchar(255) NOT NULL UNIQUE,
    enabled boolean NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS event_log(
    event_type varchar(100) NOT NULL,
    event_data jsonb NOT NULL DEFAULT '{}',
    event_time timestamptz NOT NULL DEFAULT NOW(),
    event_related_user bigint REFERENCES app_user(id) ON DELETE SET NULL,
    event_related_source bigint REFERENCES source(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS source_tags(
    source_id bigint REFERENCES source(id) ON DELETE CASCADE,
    tag_id bigint REFERENCES source_tag(id) ON DELETE CASCADE,
    PRIMARY KEY (source_id, tag_id)
);

CREATE TABLE IF NOT EXISTS source_locations(
    source_id bigint REFERENCES source(id) ON DELETE CASCADE,
    location_id bigint REFERENCES location(id) ON DELETE CASCADE,
    PRIMARY KEY (source_id, location_id)
);

CREATE TABLE IF NOT EXISTS app_user(
    id bigserial PRIMARY KEY,
    username varchar(255) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    permissions text[] NOT NULL DEFAULT ARRAY[]::text[]
);

CREATE TABLE IF NOT EXISTS audit_log(
    id bigserial PRIMARY KEY,
    user_id bigint REFERENCES app_user(id) ON DELETE SET NULL,
    action text NOT NULL,
    metadata jsonb,
    timestamp timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_search_vector ON source USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_timestamp ON audit_log(user_id, timestamp);

CREATE OR REPLACE FUNCTION source_tsv_trigger()
    RETURNS TRIGGER
    AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') || setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
    RETURN NEW;
END
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS source_tsv_update ON source;

CREATE TRIGGER source_tsv_update
    BEFORE INSERT OR UPDATE ON source
    FOR EACH ROW
    EXECUTE FUNCTION source_tsv_trigger();

