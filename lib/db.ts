import { LocationData, SourceCategory, SourceDisplayData, SourceTag } from '@/types';
import { cacheTag, updateTag } from 'next/cache';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const ensureSchema = async () => {
    const client = await pool.connect();

    try {
        await client.query(`
            CREATE EXTENSION IF NOT EXISTS ltree;

            CREATE TABLE IF NOT EXISTS source_category (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS location (
                id BIGSERIAL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                path ltree,
                parent_id BIGINT REFERENCES location(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS source_tag (
                id BIGSERIAL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS source (
                id BIGSERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                link TEXT,
                category_id BIGINT REFERENCES source_category(id) ON DELETE SET NULL,
                search_vector TSVECTOR
            );

            CREATE TABLE IF NOT EXISTS source_tags (
                source_id BIGINT REFERENCES source(id) ON DELETE CASCADE,
                tag_id BIGINT REFERENCES source_tag(id) ON DELETE CASCADE,
                PRIMARY KEY (source_id, tag_id)
            ); 

            CREATE TABLE IF NOT EXISTS source_locations (
                source_id BIGINT REFERENCES source(id) ON DELETE CASCADE,
                location_id BIGINT REFERENCES location(id) ON DELETE CASCADE,
                PRIMARY KEY (source_id, location_id)
            );

            CREATE TABLE IF NOT EXISTS app_user (
                id BIGSERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                permissions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
            );

            CREATE TABLE IF NOT EXISTS audit_log (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT REFERENCES app_user(id) ON DELETE SET NULL,
                action TEXT NOT NULL,
                metadata JSONB,
                timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_location_path ON location USING GIST (path);
            CREATE INDEX IF NOT EXISTS idx_source_search_vector ON source USING GIN (search_vector);
            CREATE INDEX IF NOT EXISTS idx_audit_log_user_timestamp ON audit_log (user_id, timestamp);

            CREATE OR REPLACE FUNCTION source_tsv_trigger() RETURNS trigger AS $$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
                RETURN NEW;
            END
            $$ LANGUAGE plpgsql;

            CREATE OR REPLACE FUNCTION update_location_path()
                RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.parent_id IS NULL THEN
                    NEW.path := NEW.name::ltree;
                ELSE
                    SELECT path || NEW.name::ltree INTO NEW.path
                    FROM location
                    WHERE id = NEW.parent_id;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE OR REPLACE FUNCTION update_descendant_paths(parent_id BIGINT)
                RETURNS VOID AS $$
            DECLARE
                child RECORD;
            BEGIN
                FOR child IN SELECT * FROM location WHERE parent_id = parent_id LOOP
                    UPDATE location SET path = 
                        (SELECT path || child.name::ltree FROM location WHERE id = parent_id)
                    WHERE id = child.id;

                    PERFORM update_descendant_paths(child.id);
                END LOOP;
            END;
            $$ LANGUAGE plpgsql;


            DROP TRIGGER IF EXISTS source_tsv_update ON source;
            CREATE TRIGGER source_tsv_update BEFORE INSERT OR UPDATE ON source 
                FOR EACH ROW EXECUTE FUNCTION source_tsv_trigger();

            DROP TRIGGER IF EXISTS location_path_update ON location;
            CREATE TRIGGER location_path_update BEFORE INSERT OR UPDATE ON location 
                FOR EACH ROW EXECUTE FUNCTION update_location_path();

            CREATE OR REPLACE FUNCTION trg_update_descendants()
                RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.parent_id IS DISTINCT FROM OLD.parent_id OR NEW.name IS DISTINCT FROM OLD.name THEN
                    PERFORM update_descendant_paths(NEW.id);
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS location_update_descendants ON location;
            CREATE TRIGGER location_update_descendants AFTER UPDATE ON location
                FOR EACH ROW EXECUTE FUNCTION trg_update_descendants();
        `);
    } catch (error) {
        console.error('Error ensuring schema:', error);
        throw error;
    } finally {
        client.release();
    }
};

export const fetchSourceTags = async (): Promise<SourceTag[]> => {
    "use cache";
    cacheTag('source-tags');
    
    const client = await pool.connect();

    try {
        const res = await client.query('SELECT id, name FROM source_tag ORDER BY name ASC');
        return res.rows.map(row => ({
            id: row.id,
            name: row.name,
        }));
    } catch (error) {
        console.error('Error fetching source tags:', error);
        throw error;
    } finally {
        client.release();
    }
};

export const fetchSourceCategories = async (): Promise<SourceCategory[]> => {
    "use cache";
    cacheTag('source-categories');

    const client = await pool.connect();

    try {
        const res = await client.query('SELECT id, name FROM source_category ORDER BY id ASC');
        return res.rows.map(row => ({
            id: row.id,
            name: row.name,
        }));
    } catch (error) {
        console.error('Error fetching source categories:', error);
        throw error;
    } finally {
        client.release();
    }
};

export const fetchLocations = async (): Promise<LocationData[]> => {
    "use cache";
    cacheTag('locations');

    const client = await pool.connect();
    
    try {
        const res = await client.query('SELECT id, name FROM location ORDER BY name ASC');
        return res.rows.map(row => ({
            id: row.id,
            name: row.name,
        }));
    } catch (error) {
        console.error('Error fetching locations:', error);
        throw error;
    } finally {
        client.release();
    }
};

export const fetchDisplaySources = async (): Promise<SourceDisplayData[]> => {
  "use cache";
  cacheTag("sources");

  const client = await pool.connect();

  try {
    const { rows } = await client.query(`
      SELECT
        s.id,
        s.title,
        s.description,
        s.link,

        sc.id AS category_id,
        sc.name AS category_name,

        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', st.id, 'name', st.name))
          FILTER (WHERE st.id IS NOT NULL),
          '[]'
        ) AS tags,

        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', l.id, 'name', l.name))
          FILTER (WHERE l.id IS NOT NULL),
          '[]'
        ) AS locations

      FROM source s
      LEFT JOIN source_category sc ON s.category_id = sc.id
      LEFT JOIN source_tags stg ON stg.source_id = s.id
      LEFT JOIN source_tag st ON stg.tag_id = st.id
      LEFT JOIN source_locations sl ON sl.source_id = s.id
      LEFT JOIN location l ON sl.location_id = l.id

      GROUP BY s.id, sc.id
      ORDER BY s.id ASC
    `);

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      link: row.link,
      category: row.category_id
        ? { id: row.category_id, name: row.category_name }
        : { id: 0, name: '' },
      tags: row.tags,
      locations: row.locations,
    }));

  } catch (error) {
    console.error("Error fetching display sources:", error);
    throw error;
  } finally {
    client.release();
  }
};
    
export const createCategory = async (name: string): Promise<SourceCategory> => {
    const client = await pool.connect();

    try {
        const res = await client.query(
            'INSERT INTO source_category (name) VALUES ($1) RETURNING id, name',
            [name]
        );

        updateTag('source-categories');

        return {
            id: res.rows[0].id,
            name: res.rows[0].name,
        };
    } catch (error) {
        console.error('Error creating source category:', error);
        throw error;
    } finally {
        client.release();
    }
};

export const createTag = async (name: string): Promise<SourceTag> => {
    const client = await pool.connect();

    try {
        const res = await client.query(
            'INSERT INTO source_tag (name) VALUES ($1) RETURNING id, name',
            [name]
        );

        updateTag('source-tags');

        return {
            id: res.rows[0].id,
            name: res.rows[0].name,
        };
    } catch (error) {
        console.error('Error creating source tag:', error);
        throw error;
    } finally {
        client.release();
    }
};

