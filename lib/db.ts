import { LocationData, SourceCategory, SourceDisplayData, SourceTag } from '@/types';
import { cacheTag, revalidateTag } from 'next/cache';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const fetchSourceTags = async (): Promise<SourceTag[]> => {
    "use cache";
    cacheTag('source-tags');

    try {
        const res = await pool.query('SELECT id, name FROM source_tag ORDER BY name ASC');
        return res.rows.map(row => ({
            id: row.id,
            name: row.name,
        }));
    } catch (error) {
        console.error('Error fetching source tags:', error);
        throw error;
    }
};

export const fetchSourceCategories = async (): Promise<SourceCategory[]> => {
    "use cache";
    cacheTag('source-categories');

    try {
        const res = await pool.query('SELECT id, name FROM source_category ORDER BY id ASC');
        return res.rows.map(row => ({
            id: row.id,
            name: row.name,
        }));
    } catch (error) {
        console.error('Error fetching source categories:', error);
        throw error;
    }
};

export const fetchLocations = async (): Promise<LocationData[]> => {
    "use cache";
    cacheTag('locations');

    try {
        const res = await pool.query('SELECT id, name FROM location ORDER BY name ASC');
        return res.rows.map(row => ({
            id: row.id,
            name: row.name,
        }));
    } catch (error) {
        console.error('Error fetching locations:', error);
        throw error;
    }
};

export const fetchDisplaySources = async (): Promise<SourceDisplayData[]> => {
    "use cache";
    cacheTag("sources");

    try {
        const { rows } = await pool.query(`
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
    }
};

export const createCategory = async (name: string): Promise<SourceCategory> => {
    try {
        const res = await pool.query(
            'INSERT INTO source_category (name) VALUES ($1) RETURNING id, name',
            [name]
        );

        revalidateTag('source-categories', 'max');

        return {
            id: res.rows[0].id,
            name: res.rows[0].name,
        };
    } catch (error) {
        console.error('Error creating source category:', error);
        throw error;
    }
};

export const createTag = async (name: string): Promise<SourceTag> => {
    try {
        const res = await pool.query(
            'INSERT INTO source_tag (name) VALUES ($1) RETURNING id, name',
            [name]
        );

        revalidateTag('source-tags', 'max');

        return {
            id: res.rows[0].id,
            name: res.rows[0].name,
        };
    } catch (error) {
        console.error('Error creating source tag:', error);
        throw error;
    }
};

export const createSourceSubmission = async (title: string, description: string, link: string): Promise<void> => {
    try {
        await pool.query(
            'INSERT INTO source_submission (title, description, link) VALUES ($1, $2, $3)',
            [title, description, link]
        );
    } catch (error) {
        console.error('Error creating source submission:', error);
        throw error;
    }
};
