import { FullSourceData, LocationData, SourceCategory, SourceDisplayData, SourceTag } from '@/types';
import { cacheTag, revalidateTag } from 'next/cache';
import pg from 'pg';
import { createNotif } from '@/lib/notifs';
import logger from '@/lib/logger';

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const getSourceById = async (id: number): Promise<FullSourceData | null> => {
    try {
        const res = await pool.query(`
            SELECT
                s.id,
                s.title,
                s.title_en,
                s.description,
                s.description_en,
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

            -- Add the WHERE clause here
            WHERE s.id = $1  -- Use your specific ID or a parameter placeholder

            GROUP BY s.id, sc.id;
            
            `, [id]);
        return res.rows[0];
    } catch (error) {
        logger.error('Error fetching source by ID:', error);
        return null;
    }
};

export const fetchSourceTags = async (): Promise<SourceTag[]> => {
    //"use cache: remote";
    //cacheTag('source-tags');

    try {
        const res = await pool.query('SELECT id, name FROM source_tag ORDER BY name ASC');
        return res.rows.map(row => ({
            id: parseInt(row.id, 10),
            name: row.name,
        }));
    } catch (error) {
        logger.error('Error fetching source tags:', error);
        return [];
    }
};

export const fetchSourceCategories = async (): Promise<SourceCategory[]> => {
    //"use cache: remote";
    //cacheTag('source-categories');

    try {
        const res = await pool.query('SELECT id, name FROM source_category ORDER BY id ASC');
        return res.rows.map(row => ({
            id: row.id,
            name: row.name,
        }));
    } catch (error) {
        logger.error('Error fetching source categories:', error);
        return [];
    }
};

export const fetchLocations = async (): Promise<LocationData[]> => {
    //"use cache: remote";
    //cacheTag('locations');

    try {
        const res = await pool.query('SELECT id, name FROM location ORDER BY id ASC');
        return res.rows.map(row => ({
            id: row.id,
            name: row.name
        }));
    } catch (error) {
        logger.error('Error fetching locations:', error);
        return [];
    }
};

export const fetchDisplaySourcesLT = async (): Promise<SourceDisplayData[]> => {
    //"use cache: remote";
    //cacheTag("sources");

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
      LIMIT 50
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
        logger.error("Error fetching display sources:", error);
        return [];
    }
};

export const fetchDisplaySourcesEN = async (): Promise<SourceDisplayData[]> => {
    //"use cache: remote";
    //cacheTag("sources");

    try {
        const { rows } = await pool.query(`
      SELECT
        s.id,
        COALESCE(s.title_en, s.title) AS title,
        COALESCE(s.description_en, s.description) AS description,
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
      LIMIT 50
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
        logger.error("Error fetching display sources:", error);
        return [];
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
        logger.error('Error creating source category:', error);
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
        logger.error('Error creating source tag:', error);
        throw error;
    }
};

export const createSourceSubmission = async (title: string, description: string, link: string): Promise<void> => {
    try {
        await pool.query(
            'INSERT INTO source_submission (title, description, link) VALUES ($1, $2, $3)',
            [title, description, link]
        );

        // Create a notification for the new source submission
        createNotif(`New source submission: "${title}"`).then(() => {
            return;
        }).catch((error) => {
            logger.error('Error creating notification for source submission:', error);
        });
    } catch (error) {
        logger.error('Error creating source submission:', error);
        throw error;
    }
};

export const createLocation = async (name: string, parentId?: number): Promise<{ id: number, name: string }> => {
    try {
        const id = await pool.query(
            'INSERT INTO location (name, parent_id) VALUES ($1, $2) RETURNING id',
            [name, parentId || null]
        );

        revalidateTag("locations", "max");

        return { id: id.rows[0].id, name };
    } catch (error) {
        logger.error('Error creating location: ', error);
        throw error;
    }
}