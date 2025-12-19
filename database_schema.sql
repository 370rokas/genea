CREATE EXTENSION IF NOT EXISTS ltree;

CREATE TABLE IF NOT EXISTS source_category(
    id bigserial PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS location(
    id bigserial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    path ltree,
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

CREATE INDEX IF NOT EXISTS idx_location_path ON location USING GIST(path);

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

CREATE OR REPLACE FUNCTION update_location_path()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.path := NEW.name::ltree;
    ELSE
        SELECT
            path || NEW.name::ltree INTO NEW.path
        FROM
            location
        WHERE
            id = NEW.parent_id;
    END IF;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_descendant_paths(parent_id bigint)
    RETURNS VOID
    AS $$
DECLARE
    child RECORD;
BEGIN
    FOR child IN
    SELECT
        *
    FROM
        location
    WHERE
        parent_id = parent_id LOOP
            UPDATE
                location
            SET
                path =(
                    SELECT
                        path || child.name::ltree
                    FROM
                        location
                    WHERE
                        id = parent_id)
            WHERE
                id = child.id;
            PERFORM
                update_descendant_paths(child.id);
        END LOOP;
END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS source_tsv_update ON source;

CREATE TRIGGER source_tsv_update
    BEFORE INSERT OR UPDATE ON source
    FOR EACH ROW
    EXECUTE FUNCTION source_tsv_trigger();

DROP TRIGGER IF EXISTS location_path_update ON location;

CREATE TRIGGER location_path_update
    BEFORE INSERT OR UPDATE ON location
    FOR EACH ROW
    EXECUTE FUNCTION update_location_path();

CREATE OR REPLACE FUNCTION trg_update_descendants()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF NEW.parent_id IS DISTINCT FROM OLD.parent_id OR NEW.name IS DISTINCT FROM OLD.name THEN
        PERFORM
            update_descendant_paths(NEW.id);
    END IF;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS location_update_descendants ON location;

CREATE TRIGGER location_update_descendants
    AFTER UPDATE ON location
    FOR EACH ROW
    EXECUTE FUNCTION trg_update_descendants();

